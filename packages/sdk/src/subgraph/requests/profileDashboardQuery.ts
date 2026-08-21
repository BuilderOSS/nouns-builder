import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants'
import type { CHAIN_ID, FeedItem } from '@buildeross/types'
import { GraphQLClient } from 'graphql-request'

export type ProfileDashboardToken = {
  tokenId: string
  tokenContract: string
  name: string
  image: string
  mintedAt: string
  dao: {
    tokenAddress: string
    name: string
    symbol: string
    contractImage: string
  }
}

export type ProfileDashboardChainResult = {
  tokens: ProfileDashboardToken[]
  auctionWins: FeedItem[]
  counts: {
    tokenHoldings: number
    proposalVotes: number
    proposalsSubmitted: number
    bidsPlaced: number
  }
  isComplete: boolean
}

export type ProfileDashboardQueryMode = 'all' | 'summary' | 'tokens'

export type ProfileDashboardQueryOptions = {
  mode?: ProfileDashboardQueryMode
  signal?: AbortSignal
}

type IdEntity = { id: string }
type CursorToken = ProfileDashboardToken & IdEntity
type AuctionSettlement = {
  id: string
  timestamp: string
  blockNumber: string
  transactionHash: `0x${string}`
  actor: `0x${string}`
  winner: `0x${string}`
  amount: string
  dao: {
    tokenAddress: `0x${string}`
    auctionAddress: `0x${string}`
    governorAddress: `0x${string}`
    metadataAddress: `0x${string}`
    treasuryAddress: `0x${string}`
    name: string
    symbol: string
    contractImage: string
  }
  auction: {
    id: string
    token: { tokenId: string; name: string; image: string }
  }
}

const TOKEN_FIELDS = `
  fragment ProfileDashboardTokenFields on Token {
    id
    tokenId
    tokenContract
    name
    image
    mintedAt
    dao {
      tokenAddress
      name
      symbol
      contractImage
    }
  }
`

const AUCTION_SETTLEMENT_FIELDS = `
  fragment ProfileDashboardAuctionSettlementFields on AuctionSettledEvent {
    id
    timestamp
    blockNumber
    transactionHash
    actor
    winner
    amount
    dao {
      tokenAddress
      auctionAddress
      governorAddress
      metadataAddress
      treasuryAddress
      name
      symbol
      contractImage
    }
    auction {
      id
      token {
        tokenId
        name
        image
      }
    }
  }
`

const PROFILE_TOKENS_PAGE_QUERY = `
  ${TOKEN_FIELDS}
  query profileDashboardTokensPage($address: Bytes!, $first: Int!, $cursor: ID!) {
    tokens(
      first: $first
      orderBy: id
      orderDirection: asc
      where: { owner: $address, id_gt: $cursor }
    ) {
      ...ProfileDashboardTokenFields
    }
  }
`

const PROFILE_COUNTS_PAGE_QUERY = `
  query profileDashboardCountsPage($address: Bytes!, $first: Int!, $skip: Int!) {
    tokens(
      first: $first
      skip: $skip
      orderBy: id
      orderDirection: asc
      where: { owner: $address }
    ) {
      id
    }
    daoTokenOwners(
      first: $first
      skip: $skip
      orderBy: id
      orderDirection: asc
      where: { owner: $address }
    ) {
      id
      daoTokenCount
    }
    proposalVotedEvents(
      first: $first
      skip: $skip
      orderBy: id
      orderDirection: asc
      where: { actor: $address }
    ) {
      id
    }
    proposalCreatedEvents(
      first: $first
      skip: $skip
      orderBy: id
      orderDirection: asc
      where: { actor: $address }
    ) {
      id
    }
    auctionBidPlacedEvents(
      first: $first
      skip: $skip
      orderBy: id
      orderDirection: asc
      where: { actor: $address }
    ) {
      id
    }
  }
`

const PROFILE_AUCTION_SETTLEMENTS_PAGE_QUERY = `
  ${AUCTION_SETTLEMENT_FIELDS}
  query profileDashboardAuctionSettlementsPage(
    $address: Bytes!
    $first: Int!
    $beforeTimestamp: BigInt!
  ) {
    auctionSettledEvents(
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: { winner: $address, timestamp_lt: $beforeTimestamp }
    ) {
      ...ProfileDashboardAuctionSettlementFields
    }
  }
`

const PROFILE_AUCTION_SETTLEMENTS_AT_TIMESTAMP_QUERY = `
  ${AUCTION_SETTLEMENT_FIELDS}
  query profileDashboardAuctionSettlementsAtTimestamp(
    $address: Bytes!
    $first: Int!
    $timestamp: BigInt!
    $cursor: ID!
  ) {
    auctionSettledEvents(
      first: $first
      orderBy: id
      orderDirection: asc
      where: { winner: $address, timestamp: $timestamp, id_gt: $cursor }
    ) {
      ...ProfileDashboardAuctionSettlementFields
    }
  }
`

const PAGE_SIZE = 250
const MAX_PAGES = 40
const INITIAL_TIMESTAMP_CURSOR = '999999999999999999999999999999999999'

type PageResult<T> = { items: T[]; isComplete: boolean }

type CountPageResult = {
  counts: ProfileDashboardChainResult['counts']
  isComplete: boolean
}

async function fetchIdCursorPages<T extends IdEntity>(
  client: GraphQLClient,
  query: string,
  collection: string,
  address: string,
  signal?: AbortSignal
): Promise<PageResult<T>> {
  const items: T[] = []
  let cursor = ''

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await client.request<Record<string, T[]>>({
      document: query,
      variables: {
        address,
        first: PAGE_SIZE,
        cursor,
      },
      signal,
    })
    const pageItems = data[collection] || []
    items.push(...pageItems)

    if (pageItems.length < PAGE_SIZE) return { items, isComplete: true }
    cursor = pageItems[pageItems.length - 1].id
  }

  return { items, isComplete: false }
}

async function fetchCountPages(
  client: GraphQLClient,
  address: string,
  signal?: AbortSignal
): Promise<CountPageResult> {
  const tokenOwners = new Map<string, number>()
  const tokens = new Set<string>()
  let sawTokenCollection = false
  const proposalVotes = new Set<string>()
  const proposals = new Set<string>()
  const bids = new Set<string>()

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await client.request<{
      tokens: IdEntity[]
      daoTokenOwners: Array<IdEntity & { daoTokenCount: number }>
      proposalVotedEvents: IdEntity[]
      proposalCreatedEvents: IdEntity[]
      auctionBidPlacedEvents: IdEntity[]
    }>({
      document: PROFILE_COUNTS_PAGE_QUERY,
      variables: {
        address,
        first: PAGE_SIZE,
        skip: page * PAGE_SIZE,
      },
      signal,
    })

    sawTokenCollection ||= Array.isArray(data.tokens)
    const tokenItems = data.tokens || []
    const tokenOwnerItems = data.daoTokenOwners || []
    const voteItems = data.proposalVotedEvents || []
    const proposalItems = data.proposalCreatedEvents || []
    const bidItems = data.auctionBidPlacedEvents || []
    tokenItems.forEach((item) => tokens.add(item.id))
    tokenOwnerItems.forEach((item) => tokenOwners.set(item.id, item.daoTokenCount))
    voteItems.forEach((item) => proposalVotes.add(item.id))
    proposalItems.forEach((item) => proposals.add(item.id))
    bidItems.forEach((item) => bids.add(item.id))

    if (
      tokenItems.length < PAGE_SIZE &&
      tokenOwnerItems.length < PAGE_SIZE &&
      voteItems.length < PAGE_SIZE &&
      proposalItems.length < PAGE_SIZE &&
      bidItems.length < PAGE_SIZE
    ) {
      return {
        counts: {
          tokenHoldings: sawTokenCollection
            ? tokens.size
            : sumTokenOwnerCounts(tokenOwners),
          proposalVotes: proposalVotes.size,
          proposalsSubmitted: proposals.size,
          bidsPlaced: bids.size,
        },
        isComplete: true,
      }
    }
  }

  return {
    counts: {
      tokenHoldings: sawTokenCollection ? tokens.size : sumTokenOwnerCounts(tokenOwners),
      proposalVotes: proposalVotes.size,
      proposalsSubmitted: proposals.size,
      bidsPlaced: bids.size,
    },
    isComplete: false,
  }
}

const sumTokenOwnerCounts = (tokenOwners: Map<string, number>) =>
  Array.from(tokenOwners.values()).reduce((total, count) => total + count, 0)

async function fetchSettlementTimestamp(
  client: GraphQLClient,
  address: string,
  timestamp: string,
  signal?: AbortSignal
): Promise<PageResult<AuctionSettlement>> {
  const items: AuctionSettlement[] = []
  let cursor = ''

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await client.request<{ auctionSettledEvents: AuctionSettlement[] }>({
      document: PROFILE_AUCTION_SETTLEMENTS_AT_TIMESTAMP_QUERY,
      variables: { address, first: PAGE_SIZE, timestamp, cursor },
      signal,
    })
    const pageItems = data.auctionSettledEvents || []
    items.push(...pageItems)

    if (pageItems.length < PAGE_SIZE) return { items, isComplete: true }
    cursor = pageItems[pageItems.length - 1].id
  }

  return { items, isComplete: false }
}

async function fetchAuctionSettlements(
  client: GraphQLClient,
  address: string,
  signal?: AbortSignal
): Promise<PageResult<AuctionSettlement>> {
  const items = new Map<string, AuctionSettlement>()
  let beforeTimestamp = INITIAL_TIMESTAMP_CURSOR

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await client.request<{ auctionSettledEvents: AuctionSettlement[] }>({
      document: PROFILE_AUCTION_SETTLEMENTS_PAGE_QUERY,
      variables: { address, first: PAGE_SIZE, beforeTimestamp },
      signal,
    })
    const pageItems = data.auctionSettledEvents || []
    pageItems.forEach((item) => items.set(item.id, item))

    if (pageItems.length < PAGE_SIZE) {
      return { items: [...items.values()], isComplete: true }
    }

    // Timestamp sorting has no secondary order. Exhaust the boundary timestamp by
    // ID before moving below it so settlements with identical timestamps are stable.
    const boundaryTimestamp = pageItems[pageItems.length - 1].timestamp
    const boundary = await fetchSettlementTimestamp(
      client,
      address,
      boundaryTimestamp,
      signal
    )
    boundary.items.forEach((item) => items.set(item.id, item))
    if (!boundary.isComplete) return { items: [...items.values()], isComplete: false }
    beforeTimestamp = boundaryTimestamp
  }

  return { items: [...items.values()], isComplete: false }
}

export const profileDashboardQuery = async (
  chainId: CHAIN_ID,
  address: string,
  { mode = 'all', signal }: ProfileDashboardQueryOptions = {}
): Promise<ProfileDashboardChainResult> => {
  const subgraphUrl = PUBLIC_SUBGRAPH_URL.get(chainId)
  if (!subgraphUrl) throw new Error(`No subgraph URL found for chain ID ${chainId}`)

  const client = new GraphQLClient(subgraphUrl, {
    headers: { 'Content-Type': 'application/json' },
  })
  const normalizedAddress = address.toLowerCase()

  if (mode === 'tokens') {
    const tokens = await fetchIdCursorPages<CursorToken>(
      client,
      PROFILE_TOKENS_PAGE_QUERY,
      'tokens',
      normalizedAddress,
      signal
    )

    return {
      tokens: tokens.items,
      auctionWins: [],
      counts: {
        tokenHoldings: tokens.items.length,
        proposalVotes: 0,
        proposalsSubmitted: 0,
        bidsPlaced: 0,
      },
      isComplete: tokens.isComplete,
    }
  }

  const tokensPromise =
    mode === 'all'
      ? fetchIdCursorPages<CursorToken>(
          client,
          PROFILE_TOKENS_PAGE_QUERY,
          'tokens',
          normalizedAddress,
          signal
        )
      : Promise.resolve<PageResult<CursorToken>>({ items: [], isComplete: true })
  const [tokens, countResult, settlements] = await Promise.all([
    tokensPromise,
    fetchCountPages(client, normalizedAddress, signal),
    fetchAuctionSettlements(client, normalizedAddress, signal),
  ])

  const auctionWins = settlements.items
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp) || a.id.localeCompare(b.id))
    .map(
      (event): FeedItem => ({
        id: event.id,
        type: 'AUCTION_SETTLED',
        daoId: event.dao.tokenAddress,
        daoName: event.dao.name,
        daoImage: event.dao.contractImage,
        daoSymbol: event.dao.symbol,
        chainId,
        timestamp: Number(event.timestamp),
        actor: event.actor,
        txHash: event.transactionHash,
        blockNumber: Number(event.blockNumber),
        addresses: {
          token: event.dao.tokenAddress,
          auction: event.dao.auctionAddress,
          governor: event.dao.governorAddress,
          metadata: event.dao.metadataAddress,
          treasury: event.dao.treasuryAddress,
        },
        auctionId: event.auction.id,
        tokenId: event.auction.token.tokenId,
        tokenName: event.auction.token.name,
        tokenImage: event.auction.token.image || '',
        winner: event.winner,
        amount: event.amount,
      })
    )

  return {
    tokens: tokens.items,
    auctionWins,
    counts: {
      ...countResult.counts,
      tokenHoldings:
        mode === 'all' && tokens.isComplete
          ? tokens.items.length
          : countResult.counts.tokenHoldings,
    },
    isComplete: [tokens, countResult, settlements].every((result) => result.isComplete),
  }
}

import type { CHAIN_ID, FeedItem } from '@buildeross/types'

import { SDK } from '../client'
import type {
  ProfileDashboardAuctionSettlementsAtTimestampQuery,
  ProfileDashboardTokensPageQuery,
} from '../sdk.generated'

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

type TokenPageRow = ProfileDashboardTokensPageQuery['tokens'][number]
type SettlementRow =
  ProfileDashboardAuctionSettlementsAtTimestampQuery['auctionSettledEvents'][number]

const PAGE_SIZE = 250
const MAX_PAGES = 40
const INITIAL_TIMESTAMP_CURSOR = '999999999999999999999999999999999999'

type ProfileDashboardSdk = ReturnType<typeof SDK.connect>

type PageResult<T> = { items: T[]; isComplete: boolean }

type CountPageResult = {
  counts: ProfileDashboardChainResult['counts']
  isComplete: boolean
}

async function fetchTokenPages(
  sdk: ProfileDashboardSdk,
  address: string,
  signal?: AbortSignal
): Promise<PageResult<ProfileDashboardToken>> {
  const items: ProfileDashboardToken[] = []
  let cursor = ''

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await sdk.profileDashboardTokensPage(
      { address, first: PAGE_SIZE, cursor },
      undefined,
      signal
    )
    const pageItems = (data.tokens || []) as TokenPageRow[]
    items.push(
      ...pageItems.map((token) => ({
        tokenId: String(token.tokenId),
        tokenContract: String(token.tokenContract),
        name: token.name,
        image: token.image || '',
        mintedAt: String(token.mintedAt),
        dao: {
          tokenAddress: String(token.dao.tokenAddress),
          name: token.dao.name,
          symbol: token.dao.symbol,
          contractImage: token.dao.contractImage,
        },
      }))
    )

    if (pageItems.length < PAGE_SIZE) return { items, isComplete: true }
    cursor = pageItems[pageItems.length - 1].id
  }

  return { items, isComplete: false }
}

async function fetchCountPages(
  sdk: ProfileDashboardSdk,
  address: string,
  signal?: AbortSignal
): Promise<CountPageResult> {
  const tokenOwners = new Map<string, number>()
  const tokens = new Set<string>()
  const proposalVotes = new Set<string>()
  const proposals = new Set<string>()
  const bids = new Set<string>()

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await sdk.profileDashboardCountsPage(
      { address, first: PAGE_SIZE, skip: page * PAGE_SIZE },
      undefined,
      signal
    )

    const tokenItems = data.tokens || []
    const tokenOwnerItems = data.daotokenOwners || []
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
          tokenHoldings: tokens.size > 0 ? tokens.size : sumTokenOwnerCounts(tokenOwners),
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
      tokenHoldings: tokens.size > 0 ? tokens.size : sumTokenOwnerCounts(tokenOwners),
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
  sdk: ProfileDashboardSdk,
  address: string,
  timestamp: string,
  signal?: AbortSignal
): Promise<PageResult<SettlementRow>> {
  const items: SettlementRow[] = []
  let cursor = ''

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await sdk.profileDashboardAuctionSettlementsAtTimestamp(
      { address, first: PAGE_SIZE, timestamp, cursor },
      undefined,
      signal
    )
    const pageItems = (data.auctionSettledEvents || []) as SettlementRow[]
    items.push(...pageItems)

    if (pageItems.length < PAGE_SIZE) return { items, isComplete: true }
    cursor = pageItems[pageItems.length - 1].id
  }

  return { items, isComplete: false }
}

async function fetchAuctionSettlements(
  sdk: ProfileDashboardSdk,
  address: string,
  signal?: AbortSignal
): Promise<PageResult<SettlementRow>> {
  const items = new Map<string, SettlementRow>()
  let beforeTimestamp = INITIAL_TIMESTAMP_CURSOR

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await sdk.profileDashboardAuctionSettlementsPage(
      { address, first: PAGE_SIZE, beforeTimestamp },
      undefined,
      signal
    )
    const pageItems = (data.auctionSettledEvents || []) as SettlementRow[]
    pageItems.forEach((item) => items.set(item.id, item))

    if (pageItems.length < PAGE_SIZE) {
      return { items: [...items.values()], isComplete: true }
    }

    // Timestamp sorting has no secondary order. Exhaust the boundary timestamp by
    // ID before moving below it so settlements with identical timestamps are stable.
    const boundaryTimestamp = pageItems[pageItems.length - 1].timestamp
    const boundary = await fetchSettlementTimestamp(
      sdk,
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
  const sdk = SDK.connect(chainId)
  const normalizedAddress = address.toLowerCase()

  if (mode === 'tokens') {
    const tokens = await fetchTokenPages(sdk, normalizedAddress, signal)

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
      ? fetchTokenPages(sdk, normalizedAddress, signal)
      : Promise.resolve<PageResult<ProfileDashboardToken>>({
          items: [],
          isComplete: true,
        })
  const [tokens, countResult, settlements] = await Promise.all([
    tokensPromise,
    fetchCountPages(sdk, normalizedAddress, signal),
    fetchAuctionSettlements(sdk, normalizedAddress, signal),
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

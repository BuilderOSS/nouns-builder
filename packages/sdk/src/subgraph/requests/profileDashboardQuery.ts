import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants'
import type { CHAIN_ID, FeedItem } from '@buildeross/types'
import { gql, GraphQLClient } from 'graphql-request'

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
    proposalVotes: number
    proposalsSubmitted: number
    bidsPlaced: number
  }
  isComplete: boolean
}

type ProfileDashboardPage = {
  tokens: ProfileDashboardToken[]
  proposalVotedEvents: Array<{ id: string }>
  proposalCreatedEvents: Array<{ id: string }>
  auctionBidPlacedEvents: Array<{ id: string }>
  auctionSettledEvents: Array<{
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
      token: {
        tokenId: string
        name: string
        image: string
      }
    }
  }>
}

const PROFILE_DASHBOARD_PAGE_QUERY = gql`
  query profileDashboardPage($address: Bytes!, $first: Int!, $skip: Int!) {
    tokens(first: $first, skip: $skip, where: { owner: $address }) {
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
    proposalVotedEvents(first: $first, skip: $skip, where: { actor: $address }) {
      id
    }
    proposalCreatedEvents(first: $first, skip: $skip, where: { actor: $address }) {
      id
    }
    auctionBidPlacedEvents(first: $first, skip: $skip, where: { actor: $address }) {
      id
    }
    auctionSettledEvents(
      first: $first
      skip: $skip
      where: { winner: $address }
      orderBy: timestamp
      orderDirection: desc
    ) {
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
  }
`

const PAGE_SIZE = 250
const MAX_PAGES = 40

const uniqueCount = (ids: string[]) => new Set(ids).size

export const profileDashboardQuery = async (
  chainId: CHAIN_ID,
  address: string
): Promise<ProfileDashboardChainResult> => {
  const subgraphUrl = PUBLIC_SUBGRAPH_URL.get(chainId)
  if (!subgraphUrl) throw new Error(`No subgraph URL found for chain ID ${chainId}`)

  const client = new GraphQLClient(subgraphUrl, {
    headers: { 'Content-Type': 'application/json' },
  })
  const tokens: ProfileDashboardToken[] = []
  const proposalVoteIds: string[] = []
  const proposalIds: string[] = []
  const bidIds: string[] = []
  const auctionWins: FeedItem[] = []
  let isComplete = false

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await client.request<ProfileDashboardPage>(
      PROFILE_DASHBOARD_PAGE_QUERY,
      {
        address: address.toLowerCase(),
        first: PAGE_SIZE,
        skip: page * PAGE_SIZE,
      }
    )

    tokens.push(...data.tokens)
    proposalVoteIds.push(...data.proposalVotedEvents.map((event) => event.id))
    proposalIds.push(...data.proposalCreatedEvents.map((event) => event.id))
    bidIds.push(...data.auctionBidPlacedEvents.map((event) => event.id))
    auctionWins.push(
      ...data.auctionSettledEvents.map(
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
    )

    const lengths = [
      data.tokens.length,
      data.proposalVotedEvents.length,
      data.proposalCreatedEvents.length,
      data.auctionBidPlacedEvents.length,
      data.auctionSettledEvents.length,
    ]
    if (lengths.every((length) => length < PAGE_SIZE)) {
      isComplete = true
      break
    }
  }

  return {
    tokens,
    auctionWins,
    counts: {
      proposalVotes: uniqueCount(proposalVoteIds),
      proposalsSubmitted: uniqueCount(proposalIds),
      bidsPlaced: uniqueCount(bidIds),
    },
    isComplete,
  }
}

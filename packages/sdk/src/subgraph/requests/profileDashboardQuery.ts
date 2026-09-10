import type { CHAIN_ID, FeedItem } from '@buildeross/types'

import { SDK } from '../client'
import type {
  ProfileDashboardAuctionSettlementsAtTimestampQuery,
  ProfileDashboardTokensPageViaProfileQuery,
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

type TokenPageRow = NonNullable<
  ProfileDashboardTokensPageViaProfileQuery['profile']
>['tokens'][number]
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

/**
 * Fetch tokens using Profile → tokens relationship (OPTIMIZED - indexed lookup)
 */
async function fetchTokenPages(
  sdk: ProfileDashboardSdk,
  address: string,
  signal?: AbortSignal
): Promise<PageResult<ProfileDashboardToken>> {
  const items: ProfileDashboardToken[] = []
  let cursor = ''

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await sdk.profileDashboardTokensPageViaProfile(
      { address, first: PAGE_SIZE, cursor },
      undefined,
      signal
    )

    // Handle null profile (user has no tokens)
    if (!data.profile) {
      return { items: [], isComplete: true }
    }

    const pageItems = (data.profile.tokens || []) as TokenPageRow[]
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

/**
 * Fetch counts using Profile entity (OPTIMIZED - instant, no pagination)
 */
async function fetchCountsViaProfile(
  sdk: ProfileDashboardSdk,
  address: string,
  signal?: AbortSignal
): Promise<CountPageResult> {
  const data = await sdk.profile(
    { address, firstOwner: 1, firstVoter: 1 },
    undefined,
    signal
  )

  if (!data.profile) {
    // Profile doesn't exist - user has no activity
    return {
      counts: {
        tokenHoldings: 0,
        proposalVotes: 0,
        proposalsSubmitted: 0,
        bidsPlaced: 0,
      },
      isComplete: true,
    }
  }

  return {
    counts: {
      tokenHoldings: data.profile.tokenCount,
      proposalVotes: data.profile.proposalVotesCount,
      proposalsSubmitted: data.profile.proposalsSubmittedCount,
      bidsPlaced: data.profile.bidsPlacedCount,
    },
    isComplete: true,
  }
}

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
    fetchCountsViaProfile(sdk, normalizedAddress, signal), // OPTIMIZED: Use Profile entity
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

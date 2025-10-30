import {
  CHAIN_ID,
  FeedItem,
  FeedResponse,
  ProposalVoteSupportType,
} from '@buildeross/types'

import { SDK } from '../client'
import {
  FeedDataQuery,
  FeedDataQueryVariables,
  GlobalFeedDataQuery,
  GlobalFeedDataQueryVariables,
  ProposalVoteSupport,
  UserActivityFeedQuery,
  UserActivityFeedQueryVariables,
} from '../sdk.generated'

interface FeedQueryParams {
  chainId: CHAIN_ID
  limit: number
  cursor?: number
  dao?: string
}

interface UserActivityQueryParams {
  chainId: CHAIN_ID
  limit: number
  cursor?: number
  actor: string
}

type FeedEvent =
  | FeedDataQuery['feedEvents'][0]
  | GlobalFeedDataQuery['feedEvents'][0]
  | UserActivityFeedQuery['feedEvents'][0]

function mapProposalVoteSupport(support: ProposalVoteSupport): ProposalVoteSupportType {
  switch (support) {
    case ProposalVoteSupport.Against:
      return 'AGAINST'
    case ProposalVoteSupport.For:
      return 'FOR'
    case ProposalVoteSupport.Abstain:
      return 'ABSTAIN'
    default:
      return 'ABSTAIN'
  }
}

function transformFeedEvent(event: FeedEvent, chainId: CHAIN_ID): FeedItem {
  const baseItem = {
    id: event.id,
    daoId: event.dao.tokenAddress,
    chainId,
    timestamp: Number(event.timestamp),
    actor: event.actor,
    txHash: event.transactionHash,
    blockNumber: Number(event.blockNumber),
  }

  switch (event.__typename) {
    case 'ProposalCreatedEvent': {
      return {
        ...baseItem,
        type: 'PROPOSAL_CREATED',
        proposalId: event.proposal.proposalId,
        proposalNumber: event.proposal.proposalNumber.toString(),
        title: event.proposal.title || '',
        description: event.proposal.description || '',
        creator: (event.proposal as any).proposer,
      }
    }

    case 'ProposalVotedEvent': {
      return {
        ...baseItem,
        type: 'PROPOSAL_VOTED',
        proposalId: event.proposal.proposalId,
        voter: event.actor,
        reason: event.vote.reason || undefined,
        support: mapProposalVoteSupport(event.vote.support),
        weight: event.vote.weight.toString(),
      }
    }

    case 'ProposalUpdatedEvent': {
      return {
        ...baseItem,
        type: 'PROPOSAL_UPDATED',
        proposalId: event.proposal.proposalId,
        messageType: (event.update as any).messageType,
        message: event.update.message,
        originalMessageId: (event.update as any).originalMessageId,
      }
    }

    case 'ProposalExecutedEvent': {
      return {
        ...baseItem,
        type: 'PROPOSAL_EXECUTED',
        proposalId: event.proposal.proposalId,
        proposalNumber: event.proposal.proposalNumber.toString(),
        title: event.proposal.title || '',
      }
    }

    case 'AuctionCreatedEvent': {
      return {
        ...baseItem,
        type: 'AUCTION_CREATED',
        auctionId: event.auction.id,
        tokenId: event.auction.token.tokenId.toString(),
        tokenName: event.auction.token.name,
        tokenImage: event.auction.token.image || '',
        startTime: Number((event.auction as any).startTime),
        endTime: Number((event.auction as any).endTime),
      }
    }

    case 'AuctionBidPlacedEvent': {
      return {
        ...baseItem,
        type: 'AUCTION_BID_PLACED',
        auctionId: event.auction.id,
        tokenId: event.auction.token.tokenId.toString(),
        bidder: event.actor,
        amount: event.bid.amount.toString(),
        tokenName: event.auction.token.name,
        tokenImage: event.auction.token.image || '',
      }
    }

    case 'AuctionSettledEvent': {
      return {
        ...baseItem,
        type: 'AUCTION_SETTLED',
        auctionId: event.auction.id,
        tokenId: event.auction.token.tokenId.toString(),
        tokenName: event.auction.token.name,
        tokenImage: event.auction.token.image || '',
        winner: event.winner,
        amount: event.amount.toString(),
      }
    }

    default: {
      const _exhaustive: never = event
      throw new Error(`Unknown event type: ${(_exhaustive as any).__typename}`)
    }
  }
}

/**
 * Get feed data for a specific chain
 * @param chainId - The chain ID to fetch from
 * @param limit - Number of items to return (1-100)
 * @param cursor - Timestamp cursor for pagination
 * @param dao - Optional DAO address to filter by
 */
export const getFeedData = async ({
  chainId,
  limit,
  cursor,
  dao,
}: FeedQueryParams): Promise<FeedResponse> => {
  try {
    // Validate input
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100')
    }

    const timestamp_lt = cursor?.toString()

    // Fetch limit + 1 to determine if there are more items
    const fetchLimit = limit + 1

    // Query the appropriate feed based on whether dao is specified
    const data = dao
      ? await SDK.connect(chainId).feedData({
          first: fetchLimit,
          timestamp_lt,
          dao: dao.toLowerCase(),
        } as FeedDataQueryVariables)
      : await SDK.connect(chainId).globalFeedData({
          first: fetchLimit,
          timestamp_lt,
        } as GlobalFeedDataQueryVariables)

    const events = data.feedEvents

    // Check if there are more items beyond the limit
    const hasMore = events.length > limit

    // Take only the requested limit
    const limitedEvents = events.slice(0, limit)

    // Transform to typed FeedItem format
    const feedItems = limitedEvents.map((event) => transformFeedEvent(event, chainId))

    // Build response
    if (hasMore && feedItems.length > 0) {
      return {
        items: feedItems,
        hasMore: true,
        nextCursor: feedItems[feedItems.length - 1].timestamp,
      }
    }

    return { items: feedItems, hasMore: false, nextCursor: null }
  } catch (e) {
    console.error('Error fetching feed', { dao, chainId, limit, cursor }, e)

    try {
      const sentry = await import('@sentry/nextjs')
      sentry.captureException(e)
      await sentry.flush(2000)
    } catch (sentryError) {
      console.error('Failed to send to Sentry:', sentryError)
    }

    return { items: [], hasMore: false, nextCursor: null }
  }
}

/**
 * Get user activity feed for a specific chain
 * @param chainId - The chain ID to fetch from
 * @param limit - Number of items to return (1-100)
 * @param cursor - Timestamp cursor for pagination
 * @param actor - User's address
 */
export const getUserActivityFeed = async ({
  chainId,
  limit,
  cursor,
  actor,
}: UserActivityQueryParams): Promise<FeedResponse> => {
  try {
    // Validate input
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100')
    }

    const timestamp_lt = cursor?.toString()
    const fetchLimit = limit + 1

    const data = await SDK.connect(chainId).userActivityFeed({
      first: fetchLimit,
      timestamp_lt,
      actor: actor.toLowerCase(),
    } as UserActivityFeedQueryVariables)

    const events = data.feedEvents
    const hasMore = events.length > limit
    const limitedEvents = events.slice(0, limit)
    const feedItems = limitedEvents.map((event) => transformFeedEvent(event, chainId))

    if (hasMore && feedItems.length > 0) {
      return {
        items: feedItems,
        hasMore: true,
        nextCursor: feedItems[feedItems.length - 1].timestamp,
      }
    }

    return { items: feedItems, hasMore: false, nextCursor: null }
  } catch (e) {
    console.error(
      'Error fetching user activity feed',
      { actor, chainId, limit, cursor },
      e
    )

    try {
      const sentry = await import('@sentry/nextjs')
      sentry.captureException(e)
      await sentry.flush(2000)
    } catch (sentryError) {
      console.error('Failed to send to Sentry:', sentryError)
    }

    return { items: [], hasMore: false, nextCursor: null }
  }
}

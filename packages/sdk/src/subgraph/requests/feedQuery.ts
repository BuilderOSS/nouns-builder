import {
  CHAIN_ID,
  FeedItem,
  FeedResponse,
  ProposalVoteSupportType,
} from '@buildeross/types'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'

import { SDK } from '../client'
import {
  FeedEvent_Filter,
  FeedEventsQuery,
  FeedEventsQueryVariables,
  FeedEventType,
  ProposalVoteSupport,
} from '../sdk.generated'

interface FeedQueryParams {
  chainId: CHAIN_ID
  limit: number
  cursor?: number
  daos?: string[]
  eventTypes?: FeedEventType[]
  actor?: string
}

const COIN_FEED_EVENT_TYPES: FeedEventType[] = [
  FeedEventType.ClankerTokenCreated,
  FeedEventType.ZoraCoinCreated,
]

type FeedEvent = FeedEventsQuery['feedEvents'][0]

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
      treasury: event.dao.treasuryAddress,
      metadata: event.dao.metadataAddress,
      governor: event.dao.governorAddress,
    },
  }

  switch (event.__typename) {
    case 'ProposalCreatedEvent': {
      return {
        ...baseItem,
        type: 'PROPOSAL_CREATED',
        proposalId: event.proposal.proposalId,
        proposalNumber: event.proposal.proposalNumber.toString(),
        proposalTitle: event.proposal.title || '',
        proposalDescription: event.proposal.description || '',
        proposalTimeCreated: String(event.proposal.timeCreated),
        proposer: event.proposal.proposer,
      }
    }

    case 'ProposalVotedEvent': {
      return {
        ...baseItem,
        type: 'PROPOSAL_VOTED',
        proposalId: event.proposal.proposalId,
        proposalNumber: event.proposal.proposalNumber.toString(),
        proposalTitle: event.proposal.title || '',
        proposalDescription: event.proposal.description || '',
        proposalTimeCreated: String(event.proposal.timeCreated),
        proposer: event.proposal.proposer,
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
        proposalNumber: event.proposal.proposalNumber.toString(),
        proposalTitle: event.proposal.title || '',
        proposalDescription: event.proposal.description || '',
        proposalTimeCreated: String(event.proposal.timeCreated),
        proposer: event.proposal.proposer,
        messageType: event.update.messageType,
        message: event.update.message,
        originalMessageId: event.update.originalMessageId,
      }
    }

    case 'ProposalExecutedEvent': {
      return {
        ...baseItem,
        type: 'PROPOSAL_EXECUTED',
        proposalId: event.proposal.proposalId,
        proposalNumber: event.proposal.proposalNumber.toString(),
        proposalTitle: event.proposal.title || '',
        proposalDescription: event.proposal.description || '',
        proposalTimeCreated: String(event.proposal.timeCreated),
        proposer: event.proposal.proposer,
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
        startTime: Number(event.auction.startTime),
        endTime: Number(event.auction.endTime),
      }
    }

    case 'AuctionBidPlacedEvent': {
      return {
        ...baseItem,
        type: 'AUCTION_BID_PLACED',
        auctionId: event.auction.id,
        tokenId: event.auction.token.tokenId.toString(),
        bidder: event.bid.bidder,
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
        winner: event.auction.token.owner,
        amount: event.amount.toString(),
      }
    }

    case 'ClankerTokenCreatedEvent': {
      return {
        ...baseItem,
        type: 'CLANKER_TOKEN_CREATED',
        tokenAddress: event.clankerToken.tokenAddress,
        tokenName: event.clankerToken.tokenName,
        tokenSymbol: event.clankerToken.tokenSymbol,
        tokenImage: event.clankerToken.tokenImage,
        poolId: event.clankerToken.poolId,
      }
    }

    case 'ZoraCoinCreatedEvent': {
      return {
        ...baseItem,
        type: 'ZORA_COIN_CREATED',
        coinAddress: event.zoraCoin.coinAddress,
        coinName: event.zoraCoin.name,
        coinSymbol: event.zoraCoin.symbol,
        coinUri: event.zoraCoin.uri,
        currency: event.zoraCoin.currency,
      }
    }

    case 'ZoraDropCreatedEvent': {
      return {
        ...baseItem,
        type: 'ZORA_DROP_CREATED',
        dropId: event.zoraDrop.id,
        dropCreator: event.zoraDrop.creator,
        dropName: event.zoraDrop.name,
        dropSymbol: event.zoraDrop.symbol,
        dropDescription: event.zoraDrop.description,
        dropImageURI: event.zoraDrop.imageURI,
        dropAnimationURI: event.zoraDrop.animationURI,
        editionSize: event.zoraDrop.editionSize.toString(),
        metadataRenderer: event.zoraDrop.metadataRenderer,
        royaltyBPS: Number(event.zoraDrop.royaltyBPS),
        fundsRecipient: event.zoraDrop.fundsRecipient,
        publicSalePrice: event.zoraDrop.publicSalePrice.toString(),
        maxSalePurchasePerAddress: Number(event.zoraDrop.maxSalePurchasePerAddress),
        publicSaleStart: Number(event.zoraDrop.publicSaleStart),
        publicSaleEnd: Number(event.zoraDrop.publicSaleEnd),
        presaleStart: Number(event.zoraDrop.presaleStart),
        presaleEnd: Number(event.zoraDrop.presaleEnd),
        presaleMerkleRoot: event.zoraDrop.presaleMerkleRoot,
      }
    }

    default: {
      const _exhaustive: never = event
      throw new Error(`Unknown event type: ${(_exhaustive as any).__typename}`)
    }
  }
}

const filterEventTypes = (
  eventTypes: FeedEventType[],
  chainId: CHAIN_ID
): FeedEventType[] => {
  if (!isChainIdSupportedByCoining(chainId)) {
    return eventTypes.filter((eventType) => !COIN_FEED_EVENT_TYPES.includes(eventType))
  }

  return eventTypes
}

/**
 * Get feed data for a specific chain
 * @param chainId - The chain ID to fetch from
 * @param limit - Number of items to return (1-100)
 * @param cursor - Timestamp cursor for pagination
 * @param daos - Optional array of DAO addresses to filter by
 * @param eventTypes - Optional array of event types to filter by
 * @param actor - Optional user address to filter by (for user activity feed)
 */
export const getFeedData = async ({
  chainId,
  limit,
  cursor,
  daos,
  eventTypes: outerEventTypes = [],
  actor,
}: FeedQueryParams): Promise<FeedResponse> => {
  // Validate input
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Limit must be an integer between 1 and 100')
  }

  try {
    // Fetch limit + 1 to determine if there are more items
    const fetchLimit = limit + 1

    // Build where clause
    const where: FeedEvent_Filter = {}
    if (cursor !== undefined) {
      where.timestamp_lt = cursor.toString()
    }
    if (actor) {
      where.actor = actor.toLowerCase()
    }
    if (daos && daos.length > 0) {
      if (daos.length === 1) {
        where.dao = daos[0].toLowerCase()
      } else {
        where.dao_in = daos.map((dao) => dao.toLowerCase())
      }
    }

    const eventTypes = filterEventTypes(outerEventTypes, chainId)

    if (eventTypes.length > 0) {
      if (eventTypes.length === 1) {
        where.type = eventTypes[0]
      } else {
        where.type_in = eventTypes
      }
    }

    const data: FeedEventsQuery = await SDK.connect(chainId).feedEvents({
      first: fetchLimit,
      where,
    } as FeedEventsQueryVariables)

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
    console.error(
      'Error fetching feed',
      { actor, daos, eventTypes: outerEventTypes, chainId, limit, cursor },
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

import {
  AuctionBidPlacedFeedItem,
  CHAIN_ID,
  FeedItem,
  FeedResponse,
  ProposalCreatedFeedItem,
  ProposalUpdatePostedFeedItem,
  ProposalVotedFeedItem,
  ProposalVoteSupportType,
} from '@buildeross/types'

import { SDK } from '../client'
import {
  FeedDataQuery,
  FeedDataQueryVariables,
  GlobalFeedDataQuery,
  GlobalFeedDataQueryVariables,
  ProposalVoteSupport,
} from '../sdk.generated'

interface FeedQueryParams {
  chainId: CHAIN_ID
  limit: number
  cursor?: string
  dao?: string
}

type CombinedFeedQuery = FeedDataQuery | GlobalFeedDataQuery

type ProposalWithItemType = CombinedFeedQuery['proposals'][0] & {
  itemType: 'PROPOSAL_CREATED'
  timestamp: any
}

type ProposalVoteWithItemType = CombinedFeedQuery['proposalVotes'][0] & {
  itemType: 'PROPOSAL_VOTED'
}

type ProposalUpdateWithItemType = CombinedFeedQuery['proposalUpdates'][0] & {
  itemType: 'PROPOSAL_UPDATE_POSTED'
}

type AuctionBidWithItemType = CombinedFeedQuery['auctionBids'][0] & {
  itemType: 'AUCTION_BID_PLACED'
  timestamp: any
}

type FeedItemWithType =
  | ProposalWithItemType
  | ProposalVoteWithItemType
  | ProposalUpdateWithItemType
  | AuctionBidWithItemType

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

function transformProposal(
  proposal: ProposalWithItemType,
  chainId: CHAIN_ID
): ProposalCreatedFeedItem {
  return {
    id: `proposal-${proposal.proposalId}`,
    type: 'PROPOSAL_CREATED',
    proposalId: proposal.proposalId,
    proposalNumber: proposal.proposalNumber.toString(),
    title: proposal.title || '',
    description: proposal.description || '',
    creator: proposal.proposer,
    daoId: proposal.dao.tokenAddress,
    chainId,
    timestamp: Number(proposal.timeCreated),
  }
}

function transformProposalVote(
  vote: ProposalVoteWithItemType,
  chainId: CHAIN_ID
): ProposalVotedFeedItem {
  return {
    id: `vote-${vote.transactionHash}`,
    type: 'PROPOSAL_VOTED',
    proposalId: vote.proposal.proposalId,
    reason: vote.reason || undefined,
    support: mapProposalVoteSupport(vote.support),
    txHash: vote.transactionHash,
    weight: vote.weight.toString(),
    voter: vote.voter,
    daoId: vote.proposal.dao.tokenAddress,
    chainId,
    timestamp: Number(vote.timestamp),
  }
}

function transformProposalUpdate(
  update: ProposalUpdateWithItemType,
  chainId: CHAIN_ID
): ProposalUpdatePostedFeedItem {
  return {
    id: `update-${update.id}`,
    type: 'PROPOSAL_UPDATE_POSTED',
    proposalId: update.proposal.proposalId,
    txHash: update.transactionHash,
    messageType: update.messageType,
    message: update.message,
    originalMessageId: update.originalMessageId,
    author: update.creator,
    daoId: update.proposal.dao.tokenAddress,
    chainId,
    timestamp: Number(update.timestamp),
  }
}

function transformAuctionBid(
  bid: AuctionBidWithItemType,
  chainId: CHAIN_ID
): AuctionBidPlacedFeedItem {
  return {
    id: `bid-${bid.transactionHash}`,
    type: 'AUCTION_BID_PLACED',
    amount: bid.amount.toString(),
    txHash: bid.transactionHash,
    bidder: bid.bidder,
    tokenId: bid.auction.token.tokenId.toString(),
    tokenImage: bid.auction.token.image || '',
    tokenName: bid.auction.token.name,
    daoId: bid.auction.dao.tokenAddress,
    chainId,
    timestamp: Number(bid.bidTime),
  }
}

function transformFeedItem(item: FeedItemWithType, chainId: CHAIN_ID): FeedItem {
  switch (item.itemType) {
    case 'PROPOSAL_CREATED':
      return transformProposal(item, chainId)
    case 'PROPOSAL_VOTED':
      return transformProposalVote(item, chainId)
    case 'PROPOSAL_UPDATE_POSTED':
      return transformProposalUpdate(item, chainId)
    case 'AUCTION_BID_PLACED':
      return transformAuctionBid(item, chainId)
    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = item
      throw new Error(`Unknown item type: ${(_exhaustive as any).itemType}`)
  }
}

export const getFeedData = async ({
  chainId,
  limit,
  cursor,
  dao,
}: FeedQueryParams): Promise<FeedResponse> => {
  try {
    const timestamp_lt = cursor ? cursor.toString() : undefined

    const data: CombinedFeedQuery = dao
      ? await SDK.connect(chainId).feedData({
          first: limit,
          skip: 0,
          timestamp_lt,
          dao: dao.toLowerCase(),
        } as FeedDataQueryVariables)
      : await SDK.connect(chainId).globalFeedData({
          first: limit,
          skip: 0,
          timestamp_lt,
        } as GlobalFeedDataQueryVariables)

    // Combine and tag all feed items with their type and normalized timestamp
    const allItems: FeedItemWithType[] = [
      ...data.proposals.map(
        (proposal): ProposalWithItemType => ({
          ...proposal,
          itemType: 'PROPOSAL_CREATED',
          timestamp: proposal.timeCreated,
        })
      ),
      ...data.proposalVotes.map(
        (vote): ProposalVoteWithItemType => ({
          ...vote,
          itemType: 'PROPOSAL_VOTED',
        })
      ),
      ...data.proposalUpdates.map(
        (update): ProposalUpdateWithItemType => ({
          ...update,
          itemType: 'PROPOSAL_UPDATE_POSTED',
        })
      ),
      ...data.auctionBids.map(
        (bid): AuctionBidWithItemType => ({
          ...bid,
          itemType: 'AUCTION_BID_PLACED',
          timestamp: bid.bidTime,
        })
      ),
    ]

    // Sort by timestamp descending
    allItems.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

    // Take only the requested limit
    const limitedItems = allItems.slice(0, limit)

    // Transform to typed FeedItem format
    const feedItems: FeedItem[] = limitedItems.map((item) =>
      transformFeedItem(item, chainId)
    )

    const hasMore = allItems.length > limit
    const nextCursor = hasMore
      ? feedItems[feedItems.length - 1]?.timestamp.toString()
      : null

    return hasMore
      ? { items: feedItems, hasMore: true, nextCursor: nextCursor! }
      : { items: feedItems, hasMore: false, nextCursor: null }
  } catch (e) {
    console.error('Error fetching feed', { dao, chainId, limit, cursor }, e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}

    return { items: [], hasMore: false, nextCursor: null }
  }
}

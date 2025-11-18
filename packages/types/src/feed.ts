import { CHAIN_ID } from './chain'
import { AddressType, BytesType } from './hex'

export const FeedItemTypes = {
  PROPOSAL_CREATED: 'PROPOSAL_CREATED',
  PROPOSAL_UPDATED: 'PROPOSAL_UPDATED',
  PROPOSAL_VOTED: 'PROPOSAL_VOTED',
  PROPOSAL_EXECUTED: 'PROPOSAL_EXECUTED',
  AUCTION_CREATED: 'AUCTION_CREATED',
  AUCTION_BID_PLACED: 'AUCTION_BID_PLACED',
  AUCTION_SETTLED: 'AUCTION_SETTLED',
} as const

export type FeedItemType = (typeof FeedItemTypes)[keyof typeof FeedItemTypes]

export const ProposalVoteSupport = {
  ABSTAIN: 'ABSTAIN',
  AGAINST: 'AGAINST',
  FOR: 'FOR',
} as const

export type ProposalVoteSupportType =
  (typeof ProposalVoteSupport)[keyof typeof ProposalVoteSupport]

export type MediaItem = {
  url: string
  type: 'image' | 'video'
  thumbnailUrl?: string
  width?: number
  height?: number
}

export type BaseFeedItem = {
  id: string
  type: FeedItemType
  daoId: AddressType
  daoName: string
  daoSymbol: string
  daoImage: string
  chainId: CHAIN_ID
  timestamp: number
  actor: AddressType
  txHash: BytesType
  blockNumber: number
}

export type ProposalCreatedFeedItem = BaseFeedItem & {
  type: 'PROPOSAL_CREATED'
  proposalId: BytesType
  proposalNumber: string
  proposalTitle: string
  proposalDescription: string
  creator: AddressType
}

export type ProposalVotedFeedItem = BaseFeedItem & {
  type: 'PROPOSAL_VOTED'
  proposalId: BytesType
  proposalNumber: string
  proposalTitle: string
  proposalDescription: string
  voter: AddressType
  reason?: string
  support: ProposalVoteSupportType
  weight: string
}

export type ProposalUpdatePostedFeedItem = BaseFeedItem & {
  type: 'PROPOSAL_UPDATED'
  proposalId: BytesType
  proposalNumber: string
  proposalTitle: string
  proposalDescription: string
  messageType: number
  message: string
  originalMessageId: BytesType
}

export type ProposalExecutedFeedItem = BaseFeedItem & {
  type: 'PROPOSAL_EXECUTED'
  proposalId: BytesType
  proposalNumber: string
  proposalTitle: string
  proposalDescription: string
}

export type AuctionCreatedFeedItem = BaseFeedItem & {
  type: 'AUCTION_CREATED'
  auctionId: string
  tokenId: string
  tokenName: string
  tokenImage: string
  startTime: number
  endTime: number
}

export type AuctionBidPlacedFeedItem = BaseFeedItem & {
  type: 'AUCTION_BID_PLACED'
  auctionId: string
  tokenId: string
  bidder: AddressType
  amount: string
  tokenName: string
  tokenImage: string
}

export type AuctionSettledFeedItem = BaseFeedItem & {
  type: 'AUCTION_SETTLED'
  auctionId: string
  tokenId: string
  tokenName: string
  tokenImage: string
  winner: AddressType
  amount: string
}

export type FeedItem =
  | ProposalCreatedFeedItem
  | ProposalVotedFeedItem
  | ProposalUpdatePostedFeedItem
  | ProposalExecutedFeedItem
  | AuctionCreatedFeedItem
  | AuctionBidPlacedFeedItem
  | AuctionSettledFeedItem

export type FeedResponse =
  | {
      items: FeedItem[]
      hasMore: false
      nextCursor: null
    }
  | {
      items: FeedItem[]
      hasMore: true
      nextCursor: number
    }

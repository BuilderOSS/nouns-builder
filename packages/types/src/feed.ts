import { CHAIN_ID } from './chain'
import { AddressType, BytesType } from './hex'

/**
 * Enum of all possible feed item types
 * Used to categorize different types of activities in the DAO feed
 */
export const FeedItemTypes = {
  PROPOSAL_CREATED: 'PROPOSAL_CREATED',
  PROPOSAL_UPDATE_POSTED: 'PROPOSAL_UPDATE_POSTED',
  PROPOSAL_VOTED: 'PROPOSAL_VOTED',
  AUCTION_BID_PLACED: 'AUCTION_BID_PLACED',
} as const

export type FeedItemType = (typeof FeedItemTypes)[keyof typeof FeedItemTypes]

/**
 * Enum for proposal vote support types
 * Maps to the Governor contract's voting options
 */
export const ProposalVoteSupport = {
  ABSTAIN: 'ABSTAIN', // Vote support = 2
  AGAINST: 'AGAINST', // Vote support = 0
  FOR: 'FOR', // Vote support = 1
} as const

export type ProposalVoteSupportType =
  (typeof ProposalVoteSupport)[keyof typeof ProposalVoteSupport]

/**
 * Base interface for all feed items
 * Contains common fields shared across all feed item types
 */
export type BaseFeedItem = {
  /** Unique identifier for the feed item (e.g., "proposal-0x123", "bid-0xabc") */
  id: string
  /** Type of feed item - determines which specific type this item represents */
  type: FeedItemType
  /** DAO token contract address - identifies which DAO this activity belongs to */
  daoId: AddressType
  /** Chain ID where this activity occurred */
  chainId: CHAIN_ID
  /** Unix timestamp in seconds when this activity occurred */
  timestamp: number
  /** Optional title for display purposes */
  title?: string
  /** Optional content/description for display purposes */
  content?: string
  /** Optional media attachments (images, videos) */
  media?: MediaItem[]
}

/**
 * Media item attached to a feed item
 * Used for images, videos, and other rich content
 */
export type MediaItem = {
  /** URL to the media file */
  url: string
  /** Type of media content */
  type: 'image' | 'video'
  /** Optional thumbnail URL, particularly useful for videos */
  thumbnailUrl?: string
  /** Optional width in pixels */
  width?: number
  /** Optional height in pixels */
  height?: number
}

/**
 * Feed item for when a new proposal is created
 * Generated from the subgraph's Proposal entity when timeCreated is set
 */
export type ProposalCreatedFeedItem = BaseFeedItem & {
  type: 'PROPOSAL_CREATED'
  /** Proposal ID from the Governor contract (keccak256 hash) */
  proposalId: BytesType
  /** Sequential proposal number as string (from proposalNumber field) */
  proposalNumber: string
  /** Proposal title from the description parsing */
  title: string
  /** Full proposal description/content */
  description: string
  /** Optional metadata extracted from proposal description */
  metadata?: Record<string, any>
  /** Address of the account that created the proposal */
  creator: AddressType
}

/**
 * Feed item for when someone votes on a proposal
 * Generated from the subgraph's ProposalVote entity
 */
export type ProposalVotedFeedItem = BaseFeedItem & {
  type: 'PROPOSAL_VOTED'
  /** Proposal ID that was voted on */
  proposalId: BytesType
  /** Optional reason provided with the vote */
  reason?: string
  /** Vote direction (FOR, AGAINST, ABSTAIN) */
  support: ProposalVoteSupportType
  /** Transaction hash of the vote transaction */
  txHash: BytesType
  /** Voting weight as string (token balance at snapshot) */
  weight: string
  /** Address of the voter */
  voter: AddressType
}

/**
 * Feed item for when a proposal update/comment is posted
 * Generated from the subgraph's ProposalUpdate entity
 */
export type ProposalUpdatePostedFeedItem = BaseFeedItem & {
  type: 'PROPOSAL_UPDATE_POSTED'
  /** Proposal ID this update relates to */
  proposalId: BytesType
  /** Transaction hash of the update transaction */
  txHash: BytesType
  /** Type of message (from messageType field) */
  messageType: number
  /** The update/comment message content */
  message: string
  /** Original message ID this update references */
  originalMessageId: BytesType
  /** Address of the update author */
  author: AddressType
}

/**
 * Feed item for when a bid is placed on an auction
 * Generated from the subgraph's AuctionBid entity
 */
export type AuctionBidPlacedFeedItem = BaseFeedItem & {
  type: 'AUCTION_BID_PLACED'
  /** Bid amount in wei as string */
  amount: string
  /** Transaction hash of the bid transaction */
  txHash: BytesType
  /** Address of the bidder */
  bidder: AddressType
  /** Token ID being auctioned (from auction.token.tokenId) */
  tokenId: string
  /** Token image URL (from auction.token.image) */
  tokenImage: string
  /** Token name (from auction.token.name) */
  tokenName: string
}

/**
 * Union type of all possible feed items
 * Use the 'type' field to discriminate between different item types
 */
export type FeedItem =
  | ProposalCreatedFeedItem
  | ProposalVotedFeedItem
  | ProposalUpdatePostedFeedItem
  | AuctionBidPlacedFeedItem

/**
 * Response type for feed data requests
 * Uses discriminated union to handle pagination state
 */
export type FeedResponse =
  | {
      /** Array of feed items for this page */
      items: FeedItem[]
      /** No more items available */
      hasMore: false
      /** No cursor for next page */
      nextCursor: null
    }
  | {
      /** Array of feed items for this page */
      items: FeedItem[]
      /** More items available for pagination */
      hasMore: true
      /** Cursor (timestamp) to use for fetching the next page */
      nextCursor: string
    }

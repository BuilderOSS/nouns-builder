import { CHAIN_ID } from './chain'
import { RequiredDaoContractAddresses } from './dao'
import { AddressType, BytesType } from './hex'

export const FeedItemTypes = {
  PROPOSAL_CREATED: 'PROPOSAL_CREATED',
  PROPOSAL_UPDATED: 'PROPOSAL_UPDATED',
  PROPOSAL_VOTED: 'PROPOSAL_VOTED',
  PROPOSAL_EXECUTED: 'PROPOSAL_EXECUTED',
  AUCTION_CREATED: 'AUCTION_CREATED',
  AUCTION_BID_PLACED: 'AUCTION_BID_PLACED',
  AUCTION_SETTLED: 'AUCTION_SETTLED',
  CLANKER_TOKEN_CREATED: 'CLANKER_TOKEN_CREATED',
  ZORA_COIN_CREATED: 'ZORA_COIN_CREATED',
  ZORA_DROP_CREATED: 'ZORA_DROP_CREATED',
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
  addresses: RequiredDaoContractAddresses
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
  proposalTimeCreated: string
  proposer: AddressType
}

export type ProposalVotedFeedItem = BaseFeedItem & {
  type: 'PROPOSAL_VOTED'
  proposalId: BytesType
  proposalNumber: string
  proposalTitle: string
  proposalDescription: string
  proposalTimeCreated: string
  proposer: AddressType
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
  proposalTimeCreated: string
  proposer: AddressType
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
  proposalTimeCreated: string
  proposer: AddressType
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

export type ClankerTokenCreatedFeedItem = BaseFeedItem & {
  type: 'CLANKER_TOKEN_CREATED'
  tokenAddress: AddressType
  tokenName: string
  tokenSymbol: string
  tokenImage: string
  poolId: BytesType
}

export type ZoraCoinCreatedFeedItem = BaseFeedItem & {
  type: 'ZORA_COIN_CREATED'
  coinAddress: AddressType
  coinName: string
  coinSymbol: string
  coinUri: string
  currency: AddressType
}

export type ZoraDropCreatedFeedItem = BaseFeedItem & {
  type: 'ZORA_DROP_CREATED'
  dropAddress: AddressType
  dropCreator: AddressType
  dropName: string
  dropSymbol: string
  dropDescription: string
  dropImageURI: string
  dropAnimationURI: string
  editionSize: string
  metadataRenderer: AddressType
  royaltyBPS: number
  fundsRecipient: AddressType
  publicSalePrice: string
  maxSalePurchasePerAddress: number
  publicSaleStart: number
  publicSaleEnd: number
  presaleStart: number
  presaleEnd: number
  presaleMerkleRoot: BytesType
}

export type FeedItem =
  | ProposalCreatedFeedItem
  | ProposalVotedFeedItem
  | ProposalUpdatePostedFeedItem
  | ProposalExecutedFeedItem
  | AuctionCreatedFeedItem
  | AuctionBidPlacedFeedItem
  | AuctionSettledFeedItem
  | ClankerTokenCreatedFeedItem
  | ZoraCoinCreatedFeedItem
  | ZoraDropCreatedFeedItem

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

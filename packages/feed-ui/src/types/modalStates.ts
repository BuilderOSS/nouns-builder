import type {
  AddressType,
  BytesType,
  CHAIN_ID,
  RequiredDaoContractAddresses,
} from '@buildeross/types'
import { Address } from 'viem'

// Modal state types
export type BidModalState = {
  chainId: CHAIN_ID
  tokenId: string
  daoName: string
  daoImage: string
  addresses: RequiredDaoContractAddresses
  highestBid?: bigint
  paused: boolean
  highestBidder?: AddressType
  endTime?: number
  tokenName: string
}

export type VoteModalState = {
  proposalId: BytesType
  proposalTitle: string
  proposalTimeCreated: string
  chainId: CHAIN_ID
  addresses: RequiredDaoContractAddresses
  daoName: string
  daoImage: string
}

export type PropdateModalState = {
  proposalId: BytesType
  chainId: CHAIN_ID
  addresses: RequiredDaoContractAddresses
  replyTo?: {
    id: `0x${string}`
    creator: `0x${string}`
    message: string
  }
  proposalTitle: string
  daoName: string
  daoImage: string
}

export type TradeModalState = {
  coinAddress: Address
  symbol: string
  chainId: CHAIN_ID
  daoName: string
  daoImage: string
}

export type MintModalState = {
  dropAddress: Address
  symbol: string
  chainId: CHAIN_ID
  daoName: string
  daoImage: string
  priceEth: string
  saleActive: boolean
  saleNotStarted: boolean
  saleEnded: boolean
  saleStart?: number
  saleEnd?: number
  editionSize?: string
  maxPerAddress?: number
}

// Callback types
export type OnOpenBidModal = (state: BidModalState) => void
export type OnOpenVoteModal = (state: VoteModalState) => void
export type OnOpenPropdateModal = (state: PropdateModalState) => void
export type OnOpenTradeModal = (state: TradeModalState) => void
export type OnOpenMintModal = (state: MintModalState) => void

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
}

export type TradeModalState = {
  coinAddress: Address
  symbol: string
  chainId: CHAIN_ID
}

// Callback types
export type OnOpenBidModal = (state: BidModalState) => void
export type OnOpenVoteModal = (state: VoteModalState) => void
export type OnOpenPropdateModal = (state: PropdateModalState) => void
export type OnOpenTradeModal = (state: TradeModalState) => void

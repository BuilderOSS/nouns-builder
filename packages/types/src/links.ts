import { CHAIN_ID } from './chain'
import { AddressType } from './hex'

export type LinkOptions = { href: string }
export type ProposalCreateStage = 'draft' | 'transactions'
export type DaoTab =
  | 'about'
  | 'activity'
  | 'admin'
  | 'gallery'
  | 'contracts'
  | 'custom-minter'
  | 'erc721-redeem'
  | 'feed'
  | 'merkle-reserve'
  | 'treasury'
export type ProposalTab = 'details' | 'votes' | 'propdates'

export type DaoLinkHandler = (
  chainId: CHAIN_ID,
  daoTokenAddress: AddressType,
  tab?: DaoTab
) => LinkOptions

export type AuctionLinkHandler = (
  chainId: CHAIN_ID,
  daoTokenAddress: AddressType,
  tokenId?: number | string | bigint
) => LinkOptions

export type ProposalLinkHandler = (
  chainId: CHAIN_ID,
  daoTokenAddress: AddressType,
  proposalId: number | string | bigint,
  tab?: ProposalTab
) => LinkOptions

export type ProposalCreateLinkHandler = (
  chainId: CHAIN_ID,
  daoTokenAddress: AddressType,
  stage?: ProposalCreateStage
) => LinkOptions

export type ProfileLinkHandler = (address: AddressType) => LinkOptions

export type CoinLinkHandler = (chainId: CHAIN_ID, coinAddress: AddressType) => LinkOptions

export type CoinCreateLinkHandler = (
  chainId: CHAIN_ID,
  daoTokenAddress: AddressType
) => LinkOptions

export type DropLinkHandler = (chainId: CHAIN_ID, dropAddress: AddressType) => LinkOptions

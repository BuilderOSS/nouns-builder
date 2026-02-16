import { CHAIN_ID } from './chain'
import { AddressType } from './hex'

export type LinkOptions = { href: string }

export type DaoLinkHandler = (
  chainId: CHAIN_ID,
  daoTokenAddress: AddressType,
  tab?: string
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
  tab?: string
) => LinkOptions

export type ProposalCreateLinkHandler = (
  chainId: CHAIN_ID,
  daoTokenAddress: AddressType
) => LinkOptions

export type ProfileLinkHandler = (address: AddressType) => LinkOptions

export type CoinLinkHandler = (chainId: CHAIN_ID, coinAddress: AddressType) => LinkOptions

export type CoinCreateLinkHandler = (
  chainId: CHAIN_ID,
  daoTokenAddress: AddressType
) => LinkOptions

import { CHAIN_ID } from './chain'
import { AddressType } from './hex'

export type LinkOptions =
  | { href: string; onClick?: never }
  | { onClick: () => void; href?: never }

export type DaoLinkHandler = (
  chainId: CHAIN_ID,
  tokenAddress: AddressType,
  tokenId?: number | string | bigint
) => LinkOptions

export type ProposalLinkHandler = (
  chainId: CHAIN_ID,
  tokenAddress: AddressType,
  proposalNumber: number
) => LinkOptions

export type ProfileLinkHandler = (
  address: AddressType
) => LinkOptions

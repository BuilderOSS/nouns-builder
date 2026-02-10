import { BASE_URL } from '@buildeross/constants/baseUrl'
import {
  AddressType,
  AuctionLinkHandler,
  CHAIN_ID,
  DaoLinkHandler,
  LinkOptions,
  ProfileLinkHandler,
  ProposalLinkHandler,
} from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { createContext, useContext } from 'react'

type CoinLinkHandler = (chainId: CHAIN_ID, address: AddressType) => LinkOptions
type PostCreateLinkHandler = (chainId: CHAIN_ID, tokenAddress: AddressType) => LinkOptions

type LinksContextValue = {
  getAuctionLink: AuctionLinkHandler
  getDaoLink: DaoLinkHandler
  getProposalLink: ProposalLinkHandler
  getProfileLink: ProfileLinkHandler
  getCoinLink: CoinLinkHandler
  getPostCreateLink: PostCreateLinkHandler
}

const defaultGetAuctionLink = (
  chainId: CHAIN_ID,
  tokenAddress: AddressType,
  tokenId?: number | string | bigint
) => {
  const baseHref = `${BASE_URL}/dao/${chainIdToSlug(chainId)}/${tokenAddress}`
  if (tokenId === undefined || tokenId === null) {
    return { href: baseHref }
  }
  return {
    href: `${baseHref}/${tokenId}`,
  }
}

const defaultGetDaoLink = (
  chainId: CHAIN_ID,
  tokenAddress: AddressType,
  tab?: string
) => {
  const baseHref = `${BASE_URL}/dao/${chainIdToSlug(chainId)}/${tokenAddress}`
  return {
    href: tab ? `${baseHref}?tab=${tab}` : baseHref,
  }
}

const defaultGetProposalLink = (
  chainId: CHAIN_ID,
  tokenAddress: AddressType,
  proposalId: number | string | bigint,
  tab?: string
) => {
  const baseHref = `${BASE_URL}/dao/${chainIdToSlug(chainId)}/${tokenAddress}/vote/${proposalId}`
  return {
    href: tab ? `${baseHref}?tab=${tab}` : baseHref,
  }
}

const defaultGetProfileLink = (address: AddressType) => {
  return {
    href: `${BASE_URL}/profile/${address}`,
  }
}

const defaultGetCoinLink = (chainId: CHAIN_ID, address: AddressType) => {
  return {
    href: `${BASE_URL}/coin/${chainIdToSlug(chainId)}/${address}`,
  }
}

const defaultGetPostCreateLink = (chainId: CHAIN_ID, tokenAddress: AddressType) => {
  return {
    href: `${BASE_URL}/dao/${chainIdToSlug(chainId)}/${tokenAddress}/post/create`,
  }
}

const LinksContext = createContext<LinksContextValue>({
  getAuctionLink: defaultGetAuctionLink,
  getDaoLink: defaultGetDaoLink,
  getProposalLink: defaultGetProposalLink,
  getProfileLink: defaultGetProfileLink,
  getCoinLink: defaultGetCoinLink,
  getPostCreateLink: defaultGetPostCreateLink,
})

export const useLinks = () => {
  return useContext(LinksContext)
}

export const LinksProvider = LinksContext.Provider

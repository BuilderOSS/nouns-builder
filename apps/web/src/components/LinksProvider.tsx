import { AddressType, CHAIN_ID } from '@buildeross/types'
import { LinksProvider as BaseLinksProvider } from '@buildeross/ui/LinksProvider'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import React from 'react'

type LinksProviderProps = {
  children: React.ReactNode
}

export const LinksProvider: React.FC<LinksProviderProps> = ({ children }) => {
  const getAuctionLink = React.useCallback(
    (
      chainId: CHAIN_ID,
      tokenAddress: AddressType,
      tokenId?: number | string | bigint
    ) => {
      const baseHref = `/dao/${chainIdToSlug(chainId)}/${tokenAddress}`
      if (tokenId === undefined || tokenId === null) {
        return { href: baseHref }
      }
      return {
        href: `${baseHref}/${tokenId}`,
      }
    },
    []
  )

  const getDaoLink = React.useCallback(
    (chainId: CHAIN_ID, tokenAddress: AddressType, tab?: string) => {
      const baseHref = `/dao/${chainIdToSlug(chainId)}/${tokenAddress}`
      return {
        href: tab ? `${baseHref}?tab=${tab}` : baseHref,
      }
    },
    []
  )

  const getProposalLink = React.useCallback(
    (
      chainId: CHAIN_ID,
      tokenAddress: AddressType,
      proposalId: string | number | bigint,
      tab?: string
    ) => {
      const baseHref = `/dao/${chainIdToSlug(chainId)}/${tokenAddress}/vote/${proposalId}`
      return {
        href: tab ? `${baseHref}?tab=${tab}` : baseHref,
      }
    },
    []
  )

  const getProfileLink = React.useCallback((address: AddressType) => {
    return {
      href: `/profile/${address}`,
    }
  }, [])

  const getCoinLink = React.useCallback((chainId: CHAIN_ID, coinAddress: AddressType) => {
    return {
      href: `/coin/${chainIdToSlug(chainId)}/${coinAddress}`,
    }
  }, [])

  const getPostCreateLink = React.useCallback(
    (chainId: CHAIN_ID, tokenAddress: AddressType) => {
      return {
        href: `/dao/${chainIdToSlug(chainId)}/${tokenAddress}/post/create`,
      }
    },
    []
  )

  const value = React.useMemo(
    () => ({
      getAuctionLink,
      getDaoLink,
      getProposalLink,
      getProfileLink,
      getCoinLink,
      getPostCreateLink,
    }),
    [
      getAuctionLink,
      getDaoLink,
      getProposalLink,
      getProfileLink,
      getCoinLink,
      getPostCreateLink,
    ]
  )

  return <BaseLinksProvider value={value}>{children}</BaseLinksProvider>
}

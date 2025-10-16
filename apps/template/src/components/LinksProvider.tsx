import { BASE_URL } from '@buildeross/constants/baseUrl'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { LinksProvider as BaseLinksProvider } from '@buildeross/ui/LinksProvider'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import React from 'react'

import { getDaoConfig } from '@/config'

type LinksProviderProps = {
  children: React.ReactNode
}

export const LinksProvider: React.FC<LinksProviderProps> = ({ children }) => {
  const daoConfig = getDaoConfig()

  // Helper function to check if the chainId/tokenAddress match our DAO
  const isOurDao = React.useCallback(
    (chainId: CHAIN_ID, tokenAddress: AddressType) => {
      return (
        chainId === daoConfig.chain.id &&
        tokenAddress.toLowerCase() === daoConfig.addresses.token.toLowerCase()
      )
    },
    [daoConfig.chain.id, daoConfig.addresses.token]
  )

  const getAuctionLink = React.useCallback(
    (
      chainId: CHAIN_ID,
      tokenAddress: AddressType,
      tokenId?: number | string | bigint
    ) => {
      // If this is not our DAO, redirect to main app
      if (!isOurDao(chainId, tokenAddress)) {
        const baseHref = `${BASE_URL}/dao/${chainIdToSlug(chainId)}/${tokenAddress}`
        if (tokenId === undefined || tokenId === null) {
          return { href: baseHref }
        }
        return { href: `${baseHref}/${tokenId}` }
      }

      // For our DAO, use local routes
      if (tokenId === undefined || tokenId === null) {
        return { href: '/' } // Home page shows current auction
      }
      return {
        href: `/token/${tokenId}`,
      }
    },
    [isOurDao]
  )

  const getDaoLink = React.useCallback(
    (chainId: CHAIN_ID, tokenAddress: AddressType, tab?: string) => {
      // If this is not our DAO, redirect to main app
      if (!isOurDao(chainId, tokenAddress)) {
        const baseHref = `${BASE_URL}/dao/${chainIdToSlug(chainId)}/${tokenAddress}`
        return {
          href: tab ? `${baseHref}?tab=${tab}` : baseHref,
        }
      }

      // For our DAO, route to different pages based on tab
      switch (tab) {
        case 'about':
          return { href: '/about' }
        case 'activity':
          return { href: '/proposals' }
        case 'treasury':
          return { href: '/treasury' }
        case 'admin':
          return { href: '/settings' }
        case 'contracts':
          return { href: '/contracts' }
        default:
          return { href: '/' } // Default to home page
      }
    },
    [isOurDao]
  )

  const getProposalLink = React.useCallback(
    (
      chainId: CHAIN_ID,
      tokenAddress: AddressType,
      proposalId: string | number | bigint
    ) => {
      // If this is not our DAO, redirect to main app
      if (!isOurDao(chainId, tokenAddress)) {
        return {
          href: `${BASE_URL}/dao/${chainIdToSlug(chainId)}/${tokenAddress}/vote/${proposalId}`,
        }
      }

      // For our DAO, use local proposal route
      return {
        href: `/proposal/${proposalId}`,
      }
    },
    [isOurDao]
  )

  const getProfileLink = React.useCallback((address: AddressType) => {
    return {
      href: `${BASE_URL}/profile/${address}`,
    }
  }, [])

  const value = React.useMemo(
    () => ({
      getAuctionLink,
      getDaoLink,
      getProposalLink,
      getProfileLink,
    }),
    [getAuctionLink, getDaoLink, getProposalLink, getProfileLink]
  )

  return <BaseLinksProvider value={value}>{children}</BaseLinksProvider>
}

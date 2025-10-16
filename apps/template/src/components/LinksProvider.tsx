import { BASE_URL } from '@buildeross/constants/baseUrl'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { LinksProvider as BaseLinksProvider } from '@buildeross/ui/LinksProvider'
import React from 'react'

type LinksProviderProps = {
  children: React.ReactNode
}

export const LinksProvider: React.FC<LinksProviderProps> = ({ children }) => {
  // Single-DAO template: simplified links without chainId/tokenAddress in URLs
  const getAuctionLink = React.useCallback(
    (
      chainId: CHAIN_ID,
      tokenAddress: AddressType,
      tokenId?: number | string | bigint
    ) => {
      if (tokenId === undefined || tokenId === null) {
        return { href: '/' } // Home page shows current auction
      }
      return {
        href: `/token/${tokenId}`,
      }
    },
    []
  )

  const getDaoLink = React.useCallback(
    (chainId: CHAIN_ID, tokenAddress: AddressType, tab?: string) => {
      // Route to different pages based on tab
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
    []
  )

  const getProposalLink = React.useCallback(
    (
      chainId: CHAIN_ID,
      tokenAddress: AddressType,
      proposalId: string | number | bigint
    ) => {
      return {
        href: `/proposal/${proposalId}`,
      }
    },
    []
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

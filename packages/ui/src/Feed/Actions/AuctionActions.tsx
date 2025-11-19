import { useCurrentAuction } from '@buildeross/hooks'
import type {
  AddressType,
  CHAIN_ID,
  RequiredDaoContractAddresses,
} from '@buildeross/types'
import { Button, Flex, Text } from '@buildeross/zord'
import React from 'react'

import { useLinks } from '../../LinksProvider'
import { LinkWrapper } from '../../LinkWrapper'

interface AuctionActionsProps {
  chainId: CHAIN_ID
  tokenId: string
  addresses: RequiredDaoContractAddresses
}

export const AuctionActions: React.FC<AuctionActionsProps> = ({
  chainId,
  tokenId,
  addresses,
}) => {
  const { getAuctionLink } = useLinks()
  const daoId = addresses.token

  const { isActive, hasEnded, settled, currentTokenId, isLoading } = useCurrentAuction({
    chainId,
    auctionAddress: addresses.auction as AddressType,
  })

  if (isLoading) {
    return (
      <Flex gap="x2" align="center">
        <Text fontSize="14" color="text3">
          Loading...
        </Text>
      </Flex>
    )
  }

  const isCurrentToken = currentTokenId?.toString() === tokenId
  const isOldAuction = !isCurrentToken

  return (
    <Flex gap="x2" align="center" wrap="wrap">
      {/* Active auction - show bid option */}
      {isActive && isCurrentToken && (
        <>
          <LinkWrapper link={getAuctionLink(chainId, daoId, tokenId)}>
            <Button size="sm" variant="outline">
              Place Bid
            </Button>
          </LinkWrapper>
          <LinkWrapper link={getAuctionLink(chainId, daoId, tokenId)}>
            <Button size="sm" variant="secondary">
              View Details
            </Button>
          </LinkWrapper>
        </>
      )}

      {/* Ended but not settled */}
      {hasEnded && !settled && isCurrentToken && (
        <>
          <LinkWrapper link={getAuctionLink(chainId, daoId, tokenId)}>
            <Button size="sm" variant="outline">
              Settle Auction
            </Button>
          </LinkWrapper>
          <LinkWrapper link={getAuctionLink(chainId, daoId, tokenId)}>
            <Button size="sm" variant="secondary">
              View Details
            </Button>
          </LinkWrapper>
        </>
      )}

      {/* Old or settled auction */}
      {(isOldAuction || settled) && (
        <>
          <LinkWrapper link={getAuctionLink(chainId, daoId, currentTokenId?.toString())}>
            <Button size="sm" variant="outline">
              Go to Latest Auction
            </Button>
          </LinkWrapper>
          <LinkWrapper link={getAuctionLink(chainId, daoId, tokenId)}>
            <Button size="sm" variant="secondary">
              View Details
            </Button>
          </LinkWrapper>
        </>
      )}
    </Flex>
  )
}

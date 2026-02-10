import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { Button, Flex } from '@buildeross/zord'
import React from 'react'

interface CoinActionsProps {
  chainId: CHAIN_ID
  coinAddress: AddressType
}

export const CoinActions: React.FC<CoinActionsProps> = ({ chainId, coinAddress }) => {
  // Build coin detail link
  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)
  const coinLink = chain ? `/coin/${chain.slug}/${coinAddress}` : '#'

  return (
    <Flex gap="x2" align="center" wrap="wrap">
      <LinkWrapper link={{ href: coinLink }}>
        <Button size="sm" px="x3" variant="secondary">
          View Details
        </Button>
      </LinkWrapper>
    </Flex>
  )
}

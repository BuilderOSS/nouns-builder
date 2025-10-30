import type { AuctionSettledFeedItem } from '@buildeross/types'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

import { FallbackImage } from '../FallbackImage'
import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemMeta, feedItemSubtitle, feedItemTitle, tokenImage } from './Feed.css'

interface AuctionSettledItemProps {
  item: AuctionSettledFeedItem
}

export const AuctionSettledItem: React.FC<AuctionSettledItemProps> = ({ item }) => {
  const { getAuctionLink } = useLinks()

  return (
    <LinkWrapper
      link={getAuctionLink(item.chainId, item.daoId, item.tokenId)}
      gap="x4"
      align="flex-start"
    >
      <Box className={tokenImage}>
        <FallbackImage src={item.tokenImage} alt={item.tokenName} />
      </Box>
      <Stack gap="x2">
        <Text className={feedItemTitle}>Auction Settled</Text>
        <Text className={feedItemSubtitle}>{item.tokenName}</Text>
        <Text className={feedItemMeta}>
          Winning bid: {formatEther(BigInt(item.amount))} ETH
        </Text>
      </Stack>
    </LinkWrapper>
  )
}

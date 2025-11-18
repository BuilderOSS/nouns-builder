import type { AuctionCreatedFeedItem } from '@buildeross/types'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { FallbackImage } from '../FallbackImage'
import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import {
  feedItemMeta,
  feedItemSubtitle,
  feedItemTitle,
  tokenImageFullWidth,
} from './Feed.css'

interface AuctionCreatedItemProps {
  item: AuctionCreatedFeedItem
}

export const AuctionCreatedItem: React.FC<AuctionCreatedItemProps> = ({ item }) => {
  const { getAuctionLink } = useLinks()

  return (
    <LinkWrapper link={getAuctionLink(item.chainId, item.daoId, item.tokenId)}>
      <Stack gap="x3" w="100%">
        {/* Full-width image */}
        <Box className={tokenImageFullWidth}>
          <FallbackImage src={item.tokenImage} alt={item.tokenName} />
        </Box>

        {/* Content below image */}
        <Stack gap="x2">
          <Text className={feedItemTitle}>Auction Started</Text>
          <Text className={feedItemSubtitle}>{item.tokenName}</Text>
          <Text className={feedItemMeta}>Token #{item.tokenId}</Text>
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}

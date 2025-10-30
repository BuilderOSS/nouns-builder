import type { AuctionCreatedFeedItem } from '@buildeross/types'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { FallbackImage } from '../FallbackImage'
import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemMeta, feedItemSubtitle, feedItemTitle, tokenImage } from './Feed.css'

interface AuctionCreatedItemProps {
  item: AuctionCreatedFeedItem
}

export const AuctionCreatedItem: React.FC<AuctionCreatedItemProps> = ({ item }) => {
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
        <Text className={feedItemTitle}>Auction Started</Text>
        <Text className={feedItemSubtitle}>{item.tokenName}</Text>
        <Text className={feedItemMeta}>Token #{item.tokenId}</Text>
      </Stack>
    </LinkWrapper>
  )
}

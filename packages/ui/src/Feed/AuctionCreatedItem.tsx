import type { AuctionCreatedFeedItem } from '@buildeross/types'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { FallbackImage } from '../FallbackImage'
import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemImage, feedItemTitle } from './Feed.css'
import { ImageSkeleton } from './FeedSkeleton'

interface AuctionCreatedItemProps {
  item: AuctionCreatedFeedItem
}

export const AuctionCreatedItem: React.FC<AuctionCreatedItemProps> = ({ item }) => {
  const { getAuctionLink } = useLinks()

  return (
    <LinkWrapper link={getAuctionLink(item.chainId, item.daoId, item.tokenId)}>
      <Stack gap="x3" w="100%">
        {/* Full-width image */}
        <Box className={feedItemImage}>
          <FallbackImage
            src={item.tokenImage}
            alt={item.tokenName}
            loadingPlaceholder={<ImageSkeleton />}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        {/* Content below image */}
        <Stack gap="x2">
          <Text className={feedItemTitle}>{item.tokenName} - Auction Started</Text>
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}

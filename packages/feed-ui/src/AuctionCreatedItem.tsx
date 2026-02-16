import type { AuctionCreatedFeedItem } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { feedItemContentHorizontal, feedItemImage, feedItemTitle } from './Feed.css'
import { ImageSkeleton } from './FeedSkeleton'

interface AuctionCreatedItemProps {
  item: AuctionCreatedFeedItem
}

export const AuctionCreatedItem: React.FC<AuctionCreatedItemProps> = ({ item }) => {
  const { getAuctionLink } = useLinks()

  return (
    <LinkWrapper link={getAuctionLink(item.chainId, item.daoId, item.tokenId)} isExternal>
      <Stack gap="x3" w="100%" className={feedItemContentHorizontal}>
        {/* Image - full-width on mobile, fixed width on desktop */}
        <Box className={feedItemImage}>
          <FallbackImage
            src={item.tokenImage}
            alt={item.tokenName}
            loadingPlaceholder={<ImageSkeleton />}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        {/* Content - below image on mobile, to the right on desktop */}
        <Stack gap="x2" style={{ flex: 1 }}>
          <Text className={feedItemTitle}>New auction for {item.tokenName}</Text>
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}

import type { ZoraCoinCreatedFeedItem } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { feedItemContentHorizontal, feedItemImage, feedItemTitle } from './Feed.css'
import { ImageSkeleton } from './FeedSkeleton'

interface ZoraCoinCreatedItemProps {
  item: ZoraCoinCreatedFeedItem
}

export const ZoraCoinCreatedItem: React.FC<ZoraCoinCreatedItemProps> = ({ item }) => {
  // Extract image from URI if it's an IPFS URI
  const imageUrl = item.coinUri.startsWith('ipfs://')
    ? `https://ipfs.io/ipfs/${item.coinUri.replace('ipfs://', '')}`
    : item.coinUri

  return (
    <Stack gap="x3" w="100%" className={feedItemContentHorizontal}>
      {/* Image - full-width on mobile, fixed width on desktop */}
      <Box className={feedItemImage}>
        <FallbackImage
          src={imageUrl}
          alt={item.coinName}
          loadingPlaceholder={<ImageSkeleton />}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>

      {/* Content - below image on mobile, to the right on desktop */}
      <Stack gap="x2" style={{ flex: 1 }}>
        <Text className={feedItemTitle}>Published post: {item.coinSymbol}</Text>
        <Text fontSize="14" color="text3">
          {item.coinName}
        </Text>
      </Stack>
    </Stack>
  )
}

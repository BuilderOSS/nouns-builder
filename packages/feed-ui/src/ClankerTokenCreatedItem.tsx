import type { ClankerTokenCreatedFeedItem } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { feedItemContentHorizontal, feedItemImage, feedItemTitle } from './Feed.css'
import { ImageSkeleton } from './FeedSkeleton'

interface ClankerTokenCreatedItemProps {
  item: ClankerTokenCreatedFeedItem
}

export const ClankerTokenCreatedItem: React.FC<ClankerTokenCreatedItemProps> = ({
  item,
}) => {
  return (
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
        <Text className={feedItemTitle}>Created creator coin {item.tokenSymbol}</Text>
        <Text fontSize="14" color="text3">
          {item.tokenName}
        </Text>
      </Stack>
    </Stack>
  )
}

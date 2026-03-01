import { useIpfsMetadata, useMediaType } from '@buildeross/hooks'
import type { ZoraCoinCreatedFeedItem } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import {
  feedItemContentHorizontal,
  feedItemImage,
  feedItemMedia,
  feedItemTitle,
} from './Feed.css'
import { ImageSkeleton } from './FeedSkeleton'

interface ZoraCoinCreatedItemProps {
  item: ZoraCoinCreatedFeedItem
}

export const ZoraCoinCreatedItem: React.FC<ZoraCoinCreatedItemProps> = ({ item }) => {
  const { getCoinLink } = useLinks()
  // Fetch metadata from IPFS to get the actual image and animation URLs
  const { metadata, imageUrl, animationUrl, isLoading } = useIpfsMetadata(item.coinUri)

  // Get media type for animation_url if present
  const {
    mediaType,
    fetchableUrl: animationFetchableUrl,
    isLoading: isMediaTypeLoading,
  } = useMediaType(animationUrl, metadata)

  // Determine what media to show - prefer animation_url over image
  const shouldUseMediaPreview = animationUrl && mediaType && animationFetchableUrl
  const displayImageUrl = imageUrl

  return (
    <LinkWrapper link={getCoinLink(item.chainId, item.coinAddress)} isExternal>
      <Stack gap="x4" w="100%" className={feedItemContentHorizontal}>
        {/* Media - full-width on mobile, fixed width on desktop */}
        {isLoading ||
        isMediaTypeLoading ||
        (!shouldUseMediaPreview && !displayImageUrl) ? (
          <Box className={feedItemImage}>
            <ImageSkeleton />
          </Box>
        ) : shouldUseMediaPreview ? (
          <Box className={feedItemMedia}>
            <MediaPreview
              mediaUrl={animationFetchableUrl}
              mediaType={mediaType}
              coverUrl={displayImageUrl || undefined}
              width="100%"
              height="100%"
              controls={false}
            />
          </Box>
        ) : (
          <Box className={feedItemImage}>
            <FallbackImage
              src={displayImageUrl!}
              alt={item.coinName}
              loadingPlaceholder={<ImageSkeleton />}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}

        {/* Content - below image on mobile, to the right on desktop */}
        <Stack gap="x2" style={{ flex: 1 }}>
          <Text className={feedItemTitle}>Published post: {item.coinSymbol}</Text>
          <Text fontSize="14" color="text3">
            {item.coinName}
          </Text>
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}

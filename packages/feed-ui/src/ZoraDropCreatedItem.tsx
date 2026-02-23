import { useMediaType } from '@buildeross/hooks'
import type { ZoraDropCreatedFeedItem } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import {
  feedItemContentHorizontal,
  feedItemImage,
  feedItemMedia,
  feedItemSubtitle,
  feedItemTextContent,
  feedItemTextContentWrapper,
  feedItemTitle,
} from './Feed.css'
import { ImageSkeleton } from './FeedSkeleton'

interface ZoraDropCreatedItemProps {
  item: ZoraDropCreatedFeedItem
}

export const ZoraDropCreatedItem: React.FC<ZoraDropCreatedItemProps> = ({ item }) => {
  const { getDropLink } = useLinks()
  // Get media type for animation_url if present
  const {
    mediaType,
    fetchableUrl: animationFetchableUrl,
    isLoading: isMediaTypeLoading,
  } = useMediaType(item.dropAnimationURI, null)

  // Determine what media to show - prefer animation_url over image
  const shouldUseMediaPreview =
    item.dropAnimationURI && mediaType && animationFetchableUrl
  const displayImageUrl = item.dropImageURI

  return (
    <LinkWrapper link={getDropLink(item.chainId, item.dropAddress)} isExternal>
      <Stack gap="x3" w="100%" className={feedItemContentHorizontal}>
        {/* Media - full-width on mobile, fixed width on desktop */}
        {isMediaTypeLoading ? (
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
            />
          </Box>
        ) : (
          <Box className={feedItemImage}>
            <FallbackImage
              src={displayImageUrl!}
              alt={item.dropName}
              loadingPlaceholder={<ImageSkeleton />}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}

        {/* Content - below image on mobile, to the right on desktop */}
        <Stack gap="x2" style={{ flex: 1 }}>
          <Text className={feedItemTitle}>Created drop: {item.dropSymbol}</Text>
          <Text className={feedItemSubtitle}>{item.dropName}</Text>
          {item.dropDescription && (
            <Box className={feedItemTextContentWrapper}>
              <Box className={feedItemTextContent}>
                <MarkdownDisplay disableLinks>{item.dropDescription}</MarkdownDisplay>
              </Box>
            </Box>
          )}
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}

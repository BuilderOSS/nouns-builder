import { getFetchableUrls } from '@buildeross/ipfs-service'
import { Box } from '@buildeross/zord'
import { useMemo } from 'react'

import { AudioPreview } from './AudioPreview'
import { ImagePreview } from './ImagePreview'
import { VideoPreview } from './VideoPreview'

export interface MediaPreviewProps {
  mediaUrl: string
  mediaType?: string
  coverUrl?: string
  width?: string | number
  height?: string | number
  /** Force a specific aspect ratio (width/height). Examples: 1, 16/9, "16/9", "1:1" */
  aspectRatio?: number | string
  controls?: boolean
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaType,
  mediaUrl,
  coverUrl,
  width,
  height,
  aspectRatio,
  controls = true,
}) => {
  // Get all fetchable URLs, using the original mediaUrl as primary and others as fallbacks
  const { primaryUrl: primaryMediaUrl, fallbackUrls: fallbackMediaUrls } = useMemo(() => {
    const fetchableUrls = getFetchableUrls(mediaUrl)
    // If getFetchableUrls returns URLs, use them as fallbacks while keeping the original as primary
    if (fetchableUrls && fetchableUrls.length > 0) {
      return {
        primaryUrl: mediaUrl,
        fallbackUrls: fetchableUrls.filter((url) => url !== mediaUrl),
      }
    }
    // Otherwise just use the mediaUrl
    return {
      primaryUrl: mediaUrl,
      fallbackUrls: [],
    }
  }, [mediaUrl])

  const { primaryUrl: primaryCoverUrl, fallbackUrls: fallbackCoverUrls } = useMemo(() => {
    if (!coverUrl) return { primaryUrl: '', fallbackUrls: [] }

    const fetchableUrls = getFetchableUrls(coverUrl)
    if (fetchableUrls && fetchableUrls.length > 0) {
      return {
        primaryUrl: coverUrl,
        fallbackUrls: fetchableUrls.filter((url) => url !== coverUrl),
      }
    }
    return {
      primaryUrl: coverUrl,
      fallbackUrls: [],
    }
  }, [coverUrl])

  if (primaryMediaUrl && mediaType?.startsWith('image')) {
    return (
      <ImagePreview
        src={primaryMediaUrl}
        fallbackSrcs={fallbackMediaUrls}
        alt="Preview"
        width={width}
        height={height}
        aspectRatio={aspectRatio}
      />
    )
  }

  if (primaryMediaUrl && mediaType?.startsWith('video')) {
    return (
      <VideoPreview
        src={primaryMediaUrl}
        fallbackSrcs={fallbackMediaUrls}
        cover={primaryCoverUrl}
        coverFallbackSrcs={fallbackCoverUrls}
        width={width}
        height={height}
        aspectRatio={aspectRatio}
        controls={controls}
      />
    )
  }

  if (primaryMediaUrl && mediaType?.startsWith('audio')) {
    return (
      <AudioPreview
        src={primaryMediaUrl}
        fallbackSrcs={fallbackMediaUrls}
        cover={primaryCoverUrl}
        coverFallbackSrcs={fallbackCoverUrls}
        width={width}
        height={height}
        aspectRatio={aspectRatio}
        controls={controls}
      />
    )
  }

  return <Box backgroundColor="background2" w="100%" h="100%" borderRadius={'curved'} />
}

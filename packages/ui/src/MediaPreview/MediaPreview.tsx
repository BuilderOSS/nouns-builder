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
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaType,
  mediaUrl,
  coverUrl,
}) => {
  const fetchableMediaURL = useMemo(
    () => getFetchableUrls(mediaUrl)?.[0] || '',
    [mediaUrl]
  )
  const fetchableCoverURL = useMemo(
    () => getFetchableUrls(coverUrl)?.[0] || '',
    [coverUrl]
  )

  if (fetchableMediaURL && mediaType?.startsWith('image')) {
    return <ImagePreview src={fetchableMediaURL} alt="Preview" />
  }

  if (fetchableMediaURL && mediaType?.startsWith('video')) {
    return <VideoPreview src={fetchableMediaURL} />
  }

  if (fetchableMediaURL && mediaType?.startsWith('audio')) {
    return <AudioPreview src={fetchableMediaURL} cover={fetchableCoverURL} />
  }

  return <Box backgroundColor="background2" w="100%" h="100%" borderRadius={'curved'} />
}

import { getFetchableUrls } from '@buildeross/ipfs-service'
import { Box } from '@buildeross/zord'
import { useMemo } from 'react'

import { Audio } from './Audio'
import { Image } from './Image'
import { Video } from './Video'

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
    return <Image src={fetchableMediaURL} alt="Preview" />
  }

  if (fetchableMediaURL && mediaType?.startsWith('video')) {
    return <Video src={fetchableMediaURL} />
  }

  if (fetchableMediaURL && mediaType?.startsWith('audio')) {
    return <Audio src={fetchableMediaURL} cover={fetchableCoverURL} />
  }

  return <Box backgroundColor="background2" w="100%" h="100%" borderRadius={'curved'} />
}

import { Box } from '@buildeross/zord'
import { useReducer } from 'react'

import { type AsyncImageSrc, useAsyncImage } from '../hooks/useAsyncImage'
import { isIOS } from '../utils/isMobile'

interface AsyncImageProps {
  alt?: string
  src: string | AsyncImageSrc | undefined
  width: number
  height: number
  background?: string
  borderRadius?: string | number
  className?: string
}

export function AsyncImage({
  alt,
  background,
  borderRadius = '6px',
  height,
  src: srcProp,
  width,
  className,
}: AsyncImageProps) {
  const ios = isIOS()
  const src = useAsyncImage(srcProp)
  const isRemoteImage = src && /^http/.test(src)
  const [isRemoteImageLoaded, setRemoteImageLoaded] = useReducer(() => true, false)

  return (
    <Box
      position="relative"
      overflow="hidden"
      style={{
        background,
        height,
        width,
        borderRadius,
      }}
      className={className}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onLoad={isRemoteImage ? setRemoteImageLoaded : undefined}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transition: 'opacity .15s linear',
            opacity: isRemoteImage && !isRemoteImageLoaded ? 0 : 1,
            userSelect: 'none',
            WebkitTouchCallout: ios ? 'none' : undefined,
            WebkitUserSelect: ios ? 'none' : undefined,
          }}
        />
      )}
    </Box>
  )
}

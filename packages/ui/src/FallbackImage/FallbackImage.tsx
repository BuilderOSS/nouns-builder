import { useFallbackSrc } from '@buildeross/hooks/useFallbackSrc'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import React, { forwardRef, useMemo } from 'react'

type FallbackImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcSet' | 'onError'
> & {
  src?: string | null
  alt?: string
  onImageError?: () => void
  errorFallbackSrc?: string
  loadingPlaceholderSrc?: string
}

export const FallbackImage = forwardRef<HTMLImageElement, FallbackImageProps>(
  (
    {
      src: srcProp,
      alt = 'image',
      onImageError,
      errorFallbackSrc,
      loadingPlaceholderSrc,
      ...rest
    },
    ref
  ) => {
    const srcList = useMemo(() => {
      if (!srcProp || srcProp === null) return []
      return getFetchableUrls(srcProp)
    }, [srcProp])

    const { src, handleError } = useFallbackSrc(srcList, {
      onImageError,
      errorFallbackSrc,
      loadingPlaceholderSrc,
    })

    if (!src) return null

    return <img ref={ref} alt={alt} src={src} onError={handleError} {...rest} />
  }
)

FallbackImage.displayName = 'FallbackImage'

import { useFallbackSrc } from '@buildeross/hooks/useFallbackSrc'
import React, { forwardRef } from 'react'

type FallbackImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcSet' | 'onError'
> & {
  srcList?: string[]
  alt?: string
  onImageError?: () => void
  errorFallbackSrc?: string
  loadingPlaceholderSrc?: string
}

export const FallbackImage = forwardRef<HTMLImageElement, FallbackImageProps>(
  (
    {
      srcList = [],
      alt = 'image',
      onImageError,
      errorFallbackSrc,
      loadingPlaceholderSrc,
      ...rest
    },
    ref
  ) => {
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

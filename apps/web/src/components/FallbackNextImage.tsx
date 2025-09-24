import { useFallbackSrc } from '@buildeross/hooks/useFallbackSrc'
import NextImage, { type ImageProps as NextImageProps } from 'next/image'
import React, { forwardRef } from 'react'

type FallbackNextImageProps = Omit<NextImageProps, 'src' | 'alt' | 'onError'> & {
  srcList?: string[]
  alt?: string
  onImageError?: () => void
  errorFallbackSrc?: string
  loadingPlaceholderSrc?: string
}

export const FallbackNextImage = forwardRef<HTMLImageElement, FallbackNextImageProps>(
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

    return <NextImage ref={ref} alt={alt} src={src} onError={handleError} {...rest} />
  }
)

FallbackNextImage.displayName = 'FallbackNextImage'

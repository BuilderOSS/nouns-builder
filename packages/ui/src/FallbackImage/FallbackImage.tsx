import { useFallbackSrc } from '@buildeross/hooks/useFallbackSrc'
import { forwardRef } from 'react'

import { BaseImageProps, useImageComponent } from '../ImageComponentProvider'

type FallbackImageProps = Omit<BaseImageProps, 'src' | 'alt' | 'onError'> & {
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

    const Image = useImageComponent()

    if (!src) return null

    return <Image ref={ref} alt={alt} src={src} onError={handleError} {...rest} />
  }
)

FallbackImage.displayName = 'FallbackImage'

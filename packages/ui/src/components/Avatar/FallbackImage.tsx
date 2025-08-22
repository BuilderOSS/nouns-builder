import React, { useCallback, useEffect, useState } from 'react'

/* -------------------------------------------------------------------------- */
/*                                Shared Hook                                 */
/* -------------------------------------------------------------------------- */

export type UseFallbackSrcReturn = {
  src: string
  handleError: () => void
  hasExhaustedSources: boolean
  isValidating: boolean
}

const useFallbackSrc = (srcList: string[] = [], onImageError?: () => void) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [validatedSrc, setValidatedSrc] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const hasExhaustedSources = currentIndex >= srcList.length
  const src = validatedSrc ? validatedSrc : hasExhaustedSources ? '/ImageError.svg' : ''

  const handleError = useCallback(() => {
    if (currentIndex < srcList.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // All sources exhausted
      if (onImageError) {
        onImageError()
      } else {
        setValidatedSrc('/ImageError.svg')
      }
    }
  }, [currentIndex, srcList.length, onImageError])

  // Validate the current image URL
  useEffect(() => {
    const currentSrc = srcList[currentIndex]
    if (!currentSrc) {
      setValidatedSrc('/ImageError.svg')
      return
    }

    setIsValidating(true)
    setValidatedSrc(null)

    // Check if the URL returns a valid image
    const checkImage = async () => {
      try {
        const response = await fetch(currentSrc, { method: 'HEAD' })
        const contentType = response.headers.get('content-type')

        if (response.ok && contentType && contentType.startsWith('image/')) {
          setValidatedSrc(currentSrc)
        } else {
          handleError()
        }
      } catch (error) {
        handleError()
      } finally {
        setIsValidating(false)
      }
    }

    checkImage()
  }, [currentIndex, srcList, handleError])

  // Reset index when srcList changes
  useEffect(() => {
    setCurrentIndex(0)
    setValidatedSrc(null)
  }, [srcList])

  return {
    src,
    handleError,
    hasExhaustedSources,
    isValidating,
  }
}

/* -------------------------------------------------------------------------- */
/*                              Standard <img> Tag                            */
/* -------------------------------------------------------------------------- */

type FallbackImageProps = {
  className?: string
  srcList?: string[]
  alt?: string
  style?: React.CSSProperties
  width?: number
  height?: number
  onImageError?: () => void
}

export const FallbackImage: React.FC<FallbackImageProps> = ({
  srcList = [],
  className,
  alt = 'image',
  style,
  onImageError,
  ...props
}) => {
  const { src, handleError } = useFallbackSrc(srcList, onImageError)

  if (!src) {
    return null
  }

  return (
    <img
      className={className}
      alt={alt}
      src={src}
      onError={handleError}
      style={style}
      {...props}
    />
  )
}

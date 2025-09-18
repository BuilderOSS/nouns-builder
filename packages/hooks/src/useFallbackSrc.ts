import { useCallback, useEffect, useMemo, useState } from 'react'

/** Default animated loading placeholder (pulsing gray). */
export const DEFAULT_LOADING_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#F2F2F2">
    <animate attributeName="fill" values="#F2F2F2;#E0E0E0;#F2F2F2" dur="1.5s" repeatCount="indefinite" />
  </rect>
</svg>
`)

/** Default error fallback */
export const DEFAULT_ERROR_FALLBACK_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#F2F2F2"/>
  <text x="50%" y="50%" text-anchor="middle" alignment-baseline="middle"
        font-size="14" fill="#808080"
        font-family="ptRoot, Arial, Helvetica, sans-serif">
    Error loading image
  </text>
</svg>
`)

export type UseFallbackSrcOptions = {
  onImageError?: () => void
  errorFallbackSrc?: string
  loadingPlaceholderSrc?: string
}

export type UseFallbackSrcReturn = {
  src: string | null
  handleError: () => void
  hasExhaustedSources: boolean
  isValidating: boolean
  currentIndex: number
}

export const useFallbackSrc = (
  srcList: string[] = [],
  options?: UseFallbackSrcOptions
): UseFallbackSrcReturn => {
  const {
    onImageError,
    errorFallbackSrc = DEFAULT_ERROR_FALLBACK_SRC,
    loadingPlaceholderSrc = DEFAULT_LOADING_PLACEHOLDER,
  } = options || {}

  const [currentIndex, setCurrentIndex] = useState(0)
  const [validatedSrc, setValidatedSrc] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const listKey = useMemo(() => srcList.join('|'), [srcList])
  const currentSrc = useMemo(() => srcList[currentIndex], [srcList, currentIndex])

  const atEnd = currentIndex >= srcList.length
  const hasExhaustedSources = atEnd

  const effectiveSrc =
    validatedSrc ??
    (isValidating ? loadingPlaceholderSrc : hasExhaustedSources ? errorFallbackSrc : null)

  const handleError = useCallback(() => {
    if (currentIndex < srcList.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      onImageError?.()
      setValidatedSrc(errorFallbackSrc)
    }
  }, [currentIndex, srcList.length, onImageError, errorFallbackSrc])

  useEffect(() => {
    if (!currentSrc) {
      setIsValidating(false)
      setValidatedSrc(errorFallbackSrc)
      return
    }

    setIsValidating(true)
    setValidatedSrc(null)

    const img = new Image()
    const onLoad = () => {
      setValidatedSrc(currentSrc)
      setIsValidating(false)
    }
    const onErr = () => {
      setIsValidating(false)
      handleError()
    }

    img.addEventListener('load', onLoad)
    img.addEventListener('error', onErr)
    img.src = currentSrc

    return () => {
      img.removeEventListener('load', onLoad)
      img.removeEventListener('error', onErr)
    }
  }, [currentSrc, handleError, errorFallbackSrc])

  useEffect(() => {
    setCurrentIndex(0)
    setValidatedSrc(null)
    setIsValidating(false)
  }, [listKey])

  return {
    src: effectiveSrc,
    handleError,
    hasExhaustedSources,
    isValidating,
    currentIndex,
  }
}

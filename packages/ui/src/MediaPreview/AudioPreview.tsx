import { Box } from '@buildeross/zord'
import { useEffect, useMemo, useState } from 'react'

export interface AudioPreviewProps {
  src: string
  /** Additional fallback URLs to try if primary src fails */
  fallbackSrcs?: string[]
  cover?: string
  /** Additional fallback URLs for cover image */
  coverFallbackSrcs?: string[]
  /** When aspect-ratio mode is used, this becomes the wrapper width. */
  width?: string | number
  /** Used only when aspectRatio is NOT provided and ratio mode is off. */
  height?: string | number

  /** Force a specific aspect ratio (width/height). Examples: 1, 16/9, "16/9", "1:1" */
  aspectRatio?: number | string

  /**
   * If true, use an aspect-ratio wrapper:
   * - wrapper width = `width` (default "100%")
   * - wrapper height computed from aspect ratio
   */
  fitToAspectRatio?: boolean

  /** Used while cover image loads (prevents layout jump). If omitted, it will size naturally until loaded. */
  fallbackAspectRatio?: number | string

  objectFit?: React.CSSProperties['objectFit']

  controls?: boolean
}

const toCssSize = (v: string | number | undefined) =>
  typeof v === 'number' ? `${v}px` : v

const normalizeAspectRatio = (r: number | string) => {
  if (typeof r === 'number') return String(r)
  return r.includes(':') ? r.replace(':', ' / ') : r
}

const EMPTY_SRCS: string[] = []

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  src,
  fallbackSrcs = EMPTY_SRCS,
  cover,
  coverFallbackSrcs = EMPTY_SRCS,
  width = '100%',
  height = 400,
  aspectRatio,
  fitToAspectRatio = true,
  fallbackAspectRatio,
  objectFit = 'cover',
  controls = true,
}) => {
  const [measuredRatio, setMeasuredRatio] = useState<number | null>(null)
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0)
  const [currentCoverIndex, setCurrentCoverIndex] = useState(0)

  // Create stable keys for source changes to prevent unnecessary re-renders
  const audioSourcesKey = useMemo(
    () => JSON.stringify([src, ...fallbackSrcs]),
    [src, fallbackSrcs]
  )

  const coverSourcesKey = useMemo(
    () => JSON.stringify([cover, ...coverFallbackSrcs]),
    [cover, coverFallbackSrcs]
  )

  // Build array of all sources with primary src first
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allSrcs = useMemo(() => [src, ...fallbackSrcs], [audioSourcesKey])
  const allCoverSrcs = useMemo(
    () => (cover ? [cover, ...coverFallbackSrcs] : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coverSourcesKey]
  )

  // Decide which ratio to use (explicit > measured > fallback)
  const ratioForBox = useMemo(() => {
    if (aspectRatio) return normalizeAspectRatio(aspectRatio)
    if (measuredRatio) return String(measuredRatio)
    if (fallbackAspectRatio) return normalizeAspectRatio(fallbackAspectRatio)
    return undefined
  }, [aspectRatio, measuredRatio, fallbackAspectRatio])

  // Reset index when sources change
  useEffect(() => {
    setCurrentSrcIndex(0)
    setMeasuredRatio(null)
  }, [audioSourcesKey])

  useEffect(() => {
    setCurrentCoverIndex(0)
    setMeasuredRatio(null)
  }, [coverSourcesKey])

  const handleAudioError = () => {
    // Try next source if available
    setCurrentSrcIndex((prev) => {
      if (prev < allSrcs.length - 1) {
        console.warn(`Audio failed to load from ${allSrcs[prev]}, trying next source...`)
        return prev + 1
      }
      return prev
    })
  }

  const handleCoverError = () => {
    // Try next cover source if available
    setCurrentCoverIndex((prev) => {
      if (prev < allCoverSrcs.length - 1) {
        console.warn(
          `Cover image failed to load from ${allCoverSrcs[prev]}, trying next source...`
        )
        return prev + 1
      }
      return prev
    })
  }

  const contentEl = (
    <Box position={'relative'} w="100%" h="100%">
      {!cover ? (
        <Box backgroundColor="background2" w="100%" h="100%" borderRadius={'curved'} />
      ) : (
        <img
          key={currentCoverIndex}
          src={allCoverSrcs[currentCoverIndex]}
          alt="Preview"
          loading="lazy"
          decoding="async"
          onError={handleCoverError}
          onLoad={(e) => {
            const img = e.currentTarget
            if (img.naturalWidth && img.naturalHeight) {
              setMeasuredRatio(img.naturalWidth / img.naturalHeight)
            }
          }}
          style={{
            borderRadius: '10px',
            objectFit,
            display: 'block',
            // In ratio-box mode we fill the box; otherwise keep the old sizing
            width: fitToAspectRatio ? '100%' : toCssSize(width),
            height: fitToAspectRatio ? '100%' : toCssSize(height),
          }}
        />
      )}

      <audio
        key={currentSrcIndex}
        src={allSrcs[currentSrcIndex]}
        loop
        preload={'auto'}
        playsInline
        controls={controls}
        onError={handleAudioError}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          width: fitToAspectRatio ? '100%' : (toCssSize(width) ?? '100%'),
          height: 'auto',
        }}
      />
    </Box>
  )

  // If we want ratio layout and we have (or want) a ratio, wrap it
  if (fitToAspectRatio && ratioForBox) {
    return (
      <div
        style={{
          width: toCssSize(width) ?? '100%',
          aspectRatio: ratioForBox,
          overflow: 'hidden',
          borderRadius: '10px',
        }}
      >
        {contentEl}
      </div>
    )
  }

  // Otherwise, old behavior (fixed width/height)
  return contentEl
}

import React, { useEffect, useMemo, useState } from 'react'

export interface VideoPreviewProps {
  src: string
  /** Additional fallback URLs to try if primary src fails */
  fallbackSrcs?: string[]
  /** Cover/poster image to show before video loads */
  cover?: string
  /** Additional fallback URLs to try if primary cover fails */
  coverFallbackSrcs?: string[]
  /** When aspect-ratio mode is used, this becomes the wrapper width. */
  width?: string | number
  /** Used only when aspectRatio is NOT provided and ratio mode is off. */
  height?: string | number

  /** Force a specific aspect ratio (width/height). Examples: 1, 16/9, "16/9", "16:9" */
  aspectRatio?: number | string

  /**
   * If true, use an aspect-ratio wrapper:
   * - wrapper width = `width` (default "100%")
   * - wrapper height computed from aspect ratio
   */
  fitToAspectRatio?: boolean

  /** Used while metadata loads (prevents layout jump). If omitted, it will size naturally until loaded. */
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

export const VideoPreview: React.FC<VideoPreviewProps> = ({
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

  // Create stable key for source changes to prevent unnecessary re-renders
  const sourcesKey = useMemo(
    () => JSON.stringify([src, ...fallbackSrcs]),
    [src, fallbackSrcs]
  )

  // Build array of all sources with primary src first
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allSrcs = useMemo(() => [src, ...fallbackSrcs], [sourcesKey])

  // Create stable key for cover changes to prevent unnecessary re-renders
  const coverSourcesKey = useMemo(
    () => JSON.stringify([cover, ...coverFallbackSrcs]),
    [cover, coverFallbackSrcs]
  )

  // Build array of all cover sources with primary cover first
  const allCoverSrcs = useMemo(
    () => (cover ? [cover, ...coverFallbackSrcs] : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coverSourcesKey]
  )

  // Reset index when sources change
  useEffect(() => {
    setCurrentSrcIndex(0)
    setMeasuredRatio(null)
  }, [sourcesKey])

  // Reset cover index when cover sources change
  useEffect(() => {
    setCurrentCoverIndex(0)
  }, [coverSourcesKey])

  // Decide which ratio to use (explicit > measured > fallback)
  const ratioForBox = useMemo(() => {
    if (aspectRatio) return normalizeAspectRatio(aspectRatio)
    if (measuredRatio) return String(measuredRatio)
    if (fallbackAspectRatio) return normalizeAspectRatio(fallbackAspectRatio)
    return undefined
  }, [aspectRatio, measuredRatio, fallbackAspectRatio])

  const handleError = () => {
    // Try next source if available
    setCurrentSrcIndex((prev) => {
      if (prev < allSrcs.length - 1) {
        console.warn(`Video failed to load from ${allSrcs[prev]}, trying next source...`)
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

  const currentCoverSrc =
    allCoverSrcs.length > 0 ? allCoverSrcs[currentCoverIndex] : undefined

  const videoEl = (
    <>
      <video
        key={allSrcs[currentSrcIndex]}
        src={allSrcs[currentSrcIndex]}
        poster={currentCoverSrc}
        autoPlay
        muted
        loop
        playsInline
        controls={controls}
        preload="metadata"
        onError={handleError}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget
          if (v.videoWidth && v.videoHeight) {
            setMeasuredRatio(v.videoWidth / v.videoHeight)
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
      {/* Hidden img element to handle cover error fallback, since video poster doesn't reliably fire onerror */}
      {currentCoverSrc && (
        <img
          key={currentCoverSrc}
          src={currentCoverSrc}
          alt=""
          onError={handleCoverError}
          style={{ display: 'none' }}
        />
      )}
    </>
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
          ...(currentCoverSrc && {
            backgroundImage: `url(${currentCoverSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }),
        }}
      >
        {videoEl}
      </div>
    )
  }

  // Otherwise, old behavior (fixed width/height)
  return videoEl
}

import React, { useMemo, useState } from 'react'

export interface ImagePreviewProps {
  src: string
  alt?: string

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

  /** Used while image loads (prevents layout jump). If omitted, it will size naturally until loaded. */
  fallbackAspectRatio?: number | string

  objectFit?: React.CSSProperties['objectFit']
}

const toCssSize = (v: string | number | undefined) =>
  typeof v === 'number' ? `${v}px` : v

const normalizeAspectRatio = (r: number | string) => {
  if (typeof r === 'number') return String(r)
  return r.includes(':') ? r.replace(':', ' / ') : r
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = 'Preview',
  width = '100%',
  height = 400,
  aspectRatio,
  fitToAspectRatio = true,
  fallbackAspectRatio,
  objectFit = 'cover',
}) => {
  const [measuredRatio, setMeasuredRatio] = useState<number | null>(null)

  // Decide which ratio to use (explicit > measured > fallback)
  const ratioForBox = useMemo(() => {
    if (aspectRatio) return normalizeAspectRatio(aspectRatio)
    if (measuredRatio) return String(measuredRatio)
    if (fallbackAspectRatio) return normalizeAspectRatio(fallbackAspectRatio)
    return undefined
  }, [aspectRatio, measuredRatio, fallbackAspectRatio])

  const imgEl = (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
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
        {imgEl}
      </div>
    )
  }

  // Otherwise, old behavior (fixed width/height)
  return imgEl
}

import { parseGif } from './gif'

/** File types accepted for trait artwork layers. */
export const ARTWORK_MIME_TYPES = ['image/png', 'image/svg+xml', 'image/gif'] as const
export type ArtworkMimeType = (typeof ARTWORK_MIME_TYPES)[number]

export const isArtworkMimeType = (type: string): type is ArtworkMimeType =>
  (ARTWORK_MIME_TYPES as readonly string[]).includes(type)

/** Raster types can share one collection: the renderer composites them together. */
const RASTER_ARTWORK_MIME_TYPES: readonly string[] = ['image/png', 'image/gif']

/** `image/svg+xml` → `.svg`, `image/png` → `.png`, `image/gif` → `.gif` */
export const mimeToArtworkExtension = (type: string | undefined): string =>
  `${type?.replace('image/', '.').replace('+xml', '').toLowerCase()}`

/**
 * PNG and GIF layers may be mixed (including with existing on-chain artwork);
 * SVG must not be mixed with raster types.
 */
export const areArtworkMimeTypesCompatible = (types: string[]): boolean => {
  const unique = Array.from(new Set(types))
  if (unique.length <= 1) return true
  return unique.every((t) => RASTER_ARTWORK_MIME_TYPES.includes(t))
}

export const GIF_ARTWORK_LIMITS = {
  maxFrames: 120,
  maxDurationMs: 10_000,
  maxBytes: 5 * 1024 * 1024,
}

/** Returns an error message if the GIF cannot be used as a trait layer. */
export const validateGifArtwork = (
  bytes: ArrayBuffer | Uint8Array,
  fileName: string,
  limits = GIF_ARTWORK_LIMITS
): string | undefined => {
  if (bytes.byteLength > limits.maxBytes) {
    const mb = (bytes.byteLength / 1024 / 1024).toFixed(1)
    return `${fileName} is ${mb}MB; GIF layers must be at most ${limits.maxBytes / 1024 / 1024}MB.`
  }

  let info
  try {
    info = parseGif(bytes)
  } catch {
    return `${fileName} is not a valid GIF file.`
  }

  if (info.truncated) return `${fileName} appears to be truncated or corrupt.`

  if (info.frameCount > limits.maxFrames) {
    return `${fileName} has ${info.frameCount} frames; GIF layers can have at most ${limits.maxFrames} frames.`
  }

  if (info.duration > limits.maxDurationMs) {
    return `${fileName} plays for ${(info.duration / 1000).toFixed(1)}s; GIF layers must loop within ${limits.maxDurationMs / 1000}s.`
  }

  return undefined
}

export type RendererLimits = {
  /** Candidate output sizes for animated output, largest first. */
  sizeSteps: number[]
  /** Loops are only extended to their LCM up to this duration. */
  maxDurationMs: number
  /** Maximum number of output frames. */
  maxFrames: number
  /** Budget for decoded raw RGBA frames (layer frames + output frames) held in memory. */
  maxRawBytes: number
  /** Serverless responses are capped (~4.5MB on Vercel); stay under this. */
  maxOutputBytes: number
}

export const STATIC_SIZE = 1080

export const DEFAULT_LIMITS: RendererLimits = {
  sizeSteps: [1080, 900, 720, 600, 540],
  maxDurationMs: 10_000,
  maxFrames: 200,
  maxRawBytes: 256 * 1024 * 1024,
  maxOutputBytes: 4 * 1024 * 1024,
}

const BYTES_PER_PIXEL = 4

/** Largest size step whose raw frame budget fits, or null if even the smallest does not. */
export const chooseOutputSize = (
  frameUnits: number,
  limits: Pick<RendererLimits, 'sizeSteps' | 'maxRawBytes'>,
  maxSize = Infinity
): number | null => {
  for (const size of limits.sizeSteps) {
    if (size > maxSize) continue
    if (frameUnits * size * size * BYTES_PER_PIXEL <= limits.maxRawBytes) return size
  }
  return null
}

/** Picks a smaller size step expected to fit the output byte budget, or null if already at the smallest. */
export const nextSizeForByteBudget = (
  currentSize: number,
  outputBytes: number,
  limits: Pick<RendererLimits, 'sizeSteps' | 'maxOutputBytes'>
): number | null => {
  const smaller = limits.sizeSteps.filter((s) => s < currentSize)
  if (smaller.length === 0) return null
  // Encoded size scales roughly with pixel area; aim 10% under budget.
  const target = currentSize * Math.sqrt((limits.maxOutputBytes / outputBytes) * 0.9)
  return smaller.find((s) => s <= target) ?? smaller[smaller.length - 1]
}

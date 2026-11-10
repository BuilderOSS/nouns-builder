/**
 * Builds the output frame timeline for a stack of layers where any layer may be
 * animated. Each layer loops independently on its own clock — the same way a
 * browser plays stacked <img> GIFs — so the output's frame boundaries are the
 * union of every layer's frame-change times.
 */

export type TimelineLayer = {
  /** Per-frame delays in ms (already browser-normalised). Length <= 1 means static. */
  delays: number[]
}

export type TimelineStep = {
  /** How long this output frame is shown, in ms. */
  delay: number
  /** Frame index to use for each input layer (0 for static layers). */
  frames: number[]
}

export type Timeline = {
  steps: TimelineStep[]
  /** Total duration of one output loop in ms (0 when nothing is animated). */
  duration: number
  isAnimated: boolean
}

export type TimelineOptions = {
  /** Upper bound for extending loops to their least common multiple. */
  maxDurationMs: number
  /** Maximum number of output frames; denser timelines are resampled. */
  maxFrames: number
  /** Output delays below this are avoided (browsers clamp <=10ms to 100ms). */
  minDelayMs?: number
  /** GIF delays are stored in 1/100s, so keep all times on this grid. */
  granularityMs?: number
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b

type PreparedLayer = {
  starts: number[] // frame start times within one loop
  loop: number // loop duration
}

const roundTo = (ms: number, granularity: number) =>
  Math.max(granularity, Math.round(ms / granularity) * granularity)

const frameAt = (layer: PreparedLayer, t: number): number => {
  const local = t % layer.loop
  // starts is ascending; find the last start <= local
  let lo = 0
  let hi = layer.starts.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (layer.starts[mid] <= local) lo = mid
    else hi = mid - 1
  }
  return lo
}

export const buildTimeline = (
  layers: TimelineLayer[],
  { maxDurationMs, maxFrames, minDelayMs = 20, granularityMs = 10 }: TimelineOptions
): Timeline => {
  const prepared: (PreparedLayer | null)[] = layers.map(({ delays }) => {
    if (delays.length <= 1) return null
    const starts: number[] = []
    let t = 0
    for (const d of delays) {
      starts.push(t)
      t += roundTo(d, granularityMs)
    }
    return { starts, loop: t }
  })

  const animated = prepared.filter((l): l is PreparedLayer => l !== null)
  if (animated.length === 0) {
    return {
      steps: [{ delay: 0, frames: layers.map(() => 0) }],
      duration: 0,
      isAnimated: false,
    }
  }

  // Extend to the LCM so every layer completes whole loops; if that is too long,
  // fall back to the longest single loop (shorter layers wrap mid-loop at the seam).
  const loops = animated.map((l) => l.loop)
  const longest = Math.max(...loops)
  let duration = granularityMs
  for (const l of loops) {
    duration = lcm(duration, l)
    if (duration > maxDurationMs) break
  }
  if (duration > maxDurationMs)
    duration = bestAlignedDuration(loops, longest, maxDurationMs)

  const changePoints = new Set<number>([0])
  for (const layer of animated) {
    for (let base = 0; base < duration; base += layer.loop) {
      for (const s of layer.starts) {
        const t = base + s
        if (t >= duration) break
        changePoints.add(t)
      }
    }
  }

  const sorted = [...changePoints].sort((a, b) => a - b)
  let boundaries = enforceMinDelay(sorted, duration, minDelayMs)

  if (boundaries.length > maxFrames) {
    const tick = Math.max(
      minDelayMs,
      Math.ceil(duration / maxFrames / granularityMs) * granularityMs
    )
    const ticks: number[] = []
    for (let t = 0; t < duration; t += tick) ticks.push(t)
    boundaries = enforceMinDelay(ticks, duration, minDelayMs)
  }

  const steps: TimelineStep[] = []
  boundaries.forEach((t, i) => {
    const end = i + 1 < boundaries.length ? boundaries[i + 1] : duration
    const frames = prepared.map((l) => (l ? frameAt(l, t) : 0))
    const prev = steps[steps.length - 1]
    if (prev && prev.frames.every((f, j) => f === frames[j])) {
      prev.delay += end - t
    } else {
      steps.push({ delay: end - t, frames })
    }
  })

  return { steps, duration, isAnimated: steps.length > 1 }
}

/**
 * When the exact LCM is too long, picks a multiple of the longest loop (within the cap)
 * at which the other layers are closest to completing whole loops, so the visible jump
 * at the output's loop seam is as small as possible. Prefers shorter durations unless a
 * longer one is meaningfully better aligned.
 */
const bestAlignedDuration = (loops: number[], longest: number, maxDurationMs: number) => {
  const misalignment = (t: number) =>
    loops.reduce((sum, l) => {
      const r = t % l
      return sum + Math.min(r, l - r) / l
    }, 0)

  const candidates: { t: number; score: number }[] = []
  for (let t = longest; t <= maxDurationMs; t += longest) {
    candidates.push({ t, score: misalignment(t) })
  }
  if (candidates.length === 0) return longest

  const best = Math.min(...candidates.map((c) => c.score))
  return candidates.find((c) => c.score <= best + 0.05)!.t
}

/** Drops boundaries closer than minDelay to the previous one, and a trailing sliver before the loop end. */
const enforceMinDelay = (sorted: number[], duration: number, minDelay: number) => {
  const kept: number[] = []
  for (const t of sorted) {
    if (kept.length === 0 || t - kept[kept.length - 1] >= minDelay) kept.push(t)
  }
  while (kept.length > 1 && duration - kept[kept.length - 1] < minDelay) kept.pop()
  return kept
}

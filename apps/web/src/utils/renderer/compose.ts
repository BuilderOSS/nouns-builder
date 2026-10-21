import { normalizeGifDelay } from '@buildeross/utils/gif'
import sharp from 'sharp'

import {
  chooseOutputSize,
  DEFAULT_LIMITS,
  nextSizeForByteBudget,
  RendererLimits,
  STATIC_SIZE,
} from './limits'
import { buildTimeline, Timeline } from './timeline'

export type AnimatedFormat = 'gif' | 'webp'

export type ComposeOptions = {
  /** Encoding used when the result is animated. Static results are always webp. */
  format?: AnimatedFormat
  /** Always return a static first-frame composite (e.g. for thumbnails). */
  forceStatic?: boolean
  limits?: Partial<RendererLimits>
}

export type ComposeResult = {
  buffer: Buffer
  contentType: string
  animated: boolean
  /** Set when animated output was requested but a static composite was returned instead. */
  fallback?: 'memory-budget' | 'output-budget' | 'error'
  size?: number
  frames?: number
  timings: Record<string, number>
}

type LayerInfo = {
  buffer: Buffer
  width: number
  height: number
  pages: number
  delays: number[]
}

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }
const CHANNELS = 4
const COMPOSITE_CONCURRENCY = 4

const CONTENT_TYPES: Record<AnimatedFormat | 'static', string> = {
  gif: 'image/gif',
  webp: 'image/webp',
  static: 'image/webp',
}

export const inspectLayer = async (buffer: Buffer): Promise<LayerInfo> => {
  const meta = await sharp(buffer, { animated: true }).metadata()
  const pages = meta.pages && meta.pages > 1 ? meta.pages : 1
  const width = meta.width ?? 0
  const height = meta.pageHeight ?? meta.height ?? 0
  const delays =
    pages > 1
      ? Array.from({ length: pages }, (_, i) => normalizeGifDelay(meta.delay?.[i] ?? 0))
      : [0]
  return { buffer, width, height, pages, delays }
}

/** Original static renderer: frame 0 of every layer, composited and encoded as webp. */
export const composeStatic = async (layers: Buffer[]): Promise<Buffer> => {
  const resized = await Promise.all(
    layers.map(async (x) =>
      sharp(x).resize(STATIC_SIZE, STATIC_SIZE, { fit: 'inside' }).toBuffer()
    )
  )

  const compositeParams = resized.slice(1).map((x) => ({
    input: x,
    gravity: 'center',
  }))

  return sharp(resized[0]).composite(compositeParams).webp({ quality: 75 }).toBuffer()
}

type Group =
  | { kind: 'static'; data: Buffer }
  | { kind: 'animated'; layerIndex: number; data: Buffer }

const mapWithConcurrency = async <T>(
  count: number,
  concurrency: number,
  fn: (index: number) => Promise<T>
): Promise<T[]> => {
  const results = new Array<T>(count)
  let next = 0
  const worker = async () => {
    while (next < count) {
      const i = next++
      results[i] = await fn(i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, count) }, worker))
  return results
}

const canvasSize = (base: LayerInfo, size: number) => {
  const scale = Math.min(size / base.width, size / base.height)
  return {
    width: Math.max(1, Math.round(base.width * scale)),
    height: Math.max(1, Math.round(base.height * scale)),
  }
}

/** Decodes layers at canvas size, merging runs of adjacent static layers into one buffer. */
const decodeGroups = async (
  layers: LayerInfo[],
  width: number,
  height: number
): Promise<Group[]> => {
  const raw = { width, height, channels: CHANNELS } as const
  const resize = { width, height, fit: 'contain' as const, background: TRANSPARENT }

  const decoded = await Promise.all(
    layers.map(async (layer, layerIndex): Promise<Group> => {
      if (layer.pages > 1) {
        const { data, info } = await sharp(layer.buffer, { animated: true })
          .resize(resize)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true })
        if (
          info.width !== width ||
          data.length !== width * height * CHANNELS * layer.pages
        )
          throw new Error(`Unexpected decoded frame size for layer ${layerIndex}`)
        return { kind: 'animated', layerIndex, data }
      }
      const data = await sharp(layer.buffer).resize(resize).ensureAlpha().raw().toBuffer()
      return { kind: 'static', data }
    })
  )

  const groups: Group[] = []
  let run: Buffer[] = []
  const flush = async () => {
    if (run.length === 0) return
    const data =
      run.length === 1
        ? run[0]
        : await sharp(run[0], { raw })
            .composite(run.slice(1).map((input) => ({ input, raw })))
            .raw()
            .toBuffer()
    groups.push({ kind: 'static', data })
    run = []
  }
  for (const group of decoded) {
    if (group.kind === 'static') {
      run.push(group.data)
    } else {
      await flush()
      groups.push(group)
    }
  }
  await flush()
  return groups
}

const composeAnimatedAt = async (
  layers: LayerInfo[],
  timeline: Timeline,
  size: number,
  format: AnimatedFormat,
  timings: Record<string, number>
): Promise<Buffer> => {
  const { width, height } = canvasSize(layers[0], size)
  const frameBytes = width * height * CHANNELS
  const raw = { width, height, channels: CHANNELS } as const

  let t = Date.now()
  const groups = await decodeGroups(layers, width, height)
  timings.decode = (timings.decode ?? 0) + Date.now() - t

  const frameOf = (group: Group, frames: number[]) => {
    if (group.kind === 'static') return group.data
    const offset = frames[group.layerIndex] * frameBytes
    return group.data.subarray(offset, offset + frameBytes)
  }

  t = Date.now()
  const strip = Buffer.alloc(frameBytes * timeline.steps.length)
  await mapWithConcurrency(timeline.steps.length, COMPOSITE_CONCURRENCY, async (i) => {
    const { frames } = timeline.steps[i]
    const [base, ...overlays] = groups.map((g) => frameOf(g, frames))
    const composed =
      overlays.length === 0
        ? base
        : await sharp(base, { raw })
            .composite(overlays.map((input) => ({ input, raw })))
            .raw()
            .toBuffer()
    composed.copy(strip, i * frameBytes)
  })
  timings.composite = (timings.composite ?? 0) + Date.now() - t

  t = Date.now()
  const delay = timeline.steps.map((s) => s.delay)
  const image = sharp(strip, {
    raw: {
      width,
      height: height * timeline.steps.length,
      channels: CHANNELS,
      pageHeight: height,
    },
  })
  const out =
    format === 'gif'
      ? await image.gif({ delay, loop: 0, dither: 0, effort: 3 }).toBuffer()
      : await image.webp({ delay, loop: 0, quality: 75, effort: 4 }).toBuffer()
  timings.encode = (timings.encode ?? 0) + Date.now() - t
  return out
}

export const composeLayers = async (
  buffers: Buffer[],
  { format = 'gif', forceStatic = false, limits: limitOverrides }: ComposeOptions = {}
): Promise<ComposeResult> => {
  const limits = { ...DEFAULT_LIMITS, ...limitOverrides }
  const timings: Record<string, number> = {}

  const staticResult = async (fallback?: ComposeResult['fallback']) => {
    const t = Date.now()
    const buffer = await composeStatic(buffers)
    timings.static = Date.now() - t
    return {
      buffer,
      contentType: CONTENT_TYPES.static,
      animated: false,
      fallback,
      timings,
    }
  }

  if (forceStatic) return staticResult()

  let layers: LayerInfo[]
  try {
    layers = await Promise.all(buffers.map(inspectLayer))
  } catch (err) {
    console.warn('Renderer: failed to inspect layers, using static composite', err)
    return staticResult('error')
  }
  if (!layers.some((l) => l.pages > 1)) return staticResult()

  const timeline = buildTimeline(layers, limits)
  if (!timeline.isAnimated) return staticResult()

  const frameUnits =
    timeline.steps.length +
    layers.reduce((sum, l) => sum + (l.pages > 1 ? l.pages : 1), 0)
  let size = chooseOutputSize(frameUnits, limits)
  if (size === null) return staticResult('memory-budget')

  while (true) {
    let buffer: Buffer
    try {
      buffer = await composeAnimatedAt(layers, timeline, size, format, timings)
    } catch (err) {
      console.error('Renderer: animated composition failed, using static composite', err)
      return staticResult('error')
    }

    if (buffer.length <= limits.maxOutputBytes) {
      return {
        buffer,
        contentType: CONTENT_TYPES[format],
        animated: true,
        size,
        frames: timeline.steps.length,
        timings,
      }
    }

    const next = nextSizeForByteBudget(size, buffer.length, limits)
    if (next === null) return staticResult('output-budget')
    size = next
  }
}

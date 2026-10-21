// @vitest-environment node
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { composeLayers, composeStatic } from './compose'
import {
  BLUE,
  decodeFrames,
  GREEN,
  makeGif,
  makePng,
  makeSvg,
  rect,
  RED,
  solid,
  TRANSPARENT,
  WHITE,
} from './testImages'

const SIZE = 60

/** A transparent GIF with a red box moving left→right across `n` frames in the top band. */
const movingBox = (n: number, delay: number | number[] = 100) =>
  makeGif(
    SIZE,
    Array.from({ length: n }, (_, i) => rect(RED, [i / n, 0, (i + 1) / n, 0.25])(SIZE)),
    delay
  )

/** Mirrors the renderer implementation that shipped before animated support. */
const legacyRender = async (layers: Buffer[]) => {
  const resized = await Promise.all(
    layers.map((x) => sharp(x).resize(1080, 1080, { fit: 'inside' }).toBuffer())
  )
  return sharp(resized[0])
    .composite(resized.slice(1).map((input) => ({ input, gravity: 'center' })))
    .webp({ quality: 75 })
    .toBuffer()
}

describe('composeLayers — static stacks', () => {
  it('is byte-identical to the legacy renderer for PNG stacks', async () => {
    const layers = [
      await makePng(SIZE, solid(BLUE)),
      await makePng(SIZE, rect(WHITE, [0.25, 0.25, 0.75, 0.75])(SIZE)),
    ]
    const result = await composeLayers(layers)
    expect(result.animated).toBe(false)
    expect(result.contentType).toBe('image/webp')
    expect(result.fallback).toBeUndefined()
    expect(result.buffer.equals(await legacyRender(layers))).toBe(true)
  })

  it('keeps SVG + PNG stacks on the static path', async () => {
    const layers = [await makePng(SIZE, solid(BLUE)), makeSvg(SIZE)]
    const result = await composeLayers(layers)
    expect(result.animated).toBe(false)
    expect(result.buffer.equals(await composeStatic(layers))).toBe(true)
  })

  it('renders single-frame GIF layers as static webp', async () => {
    const layers = [await makePng(SIZE, solid(BLUE)), await makeGif(SIZE, [solid(GREEN)])]
    const result = await composeLayers(layers)
    expect(result.animated).toBe(false)
    expect(result.contentType).toBe('image/webp')
  })
})

describe('composeLayers — animated stacks', () => {
  it('composites an animated GIF over a PNG base frame by frame', async () => {
    const layers = [await makePng(SIZE, solid(BLUE)), await movingBox(3)]
    const result = await composeLayers(layers)

    expect(result.animated).toBe(true)
    expect(result.contentType).toBe('image/gif')
    expect(result.size).toBe(1080)

    const out = await decodeFrames(result.buffer)
    expect(out.format).toBe('gif')
    expect(out.pages).toBe(3)
    expect(out.delay).toEqual([100, 100, 100])
    expect(out.loop).toBe(0)
    expect([out.width, out.height]).toEqual([1080, 1080])

    for (let f = 0; f < 3; f++) {
      for (let box = 0; box < 3; box++) {
        // centre of each box slot in the top band
        const px = out.pixel(f, (box + 0.5) / 3, 0.1)
        expect(px).toEqual(box === f ? RED : BLUE)
      }
      // transparent areas of the GIF show the base
      expect(out.pixel(f, 0.5, 0.75)).toEqual(BLUE)
    }
  })

  it('preserves layer order: static layers above an animated layer stay on top', async () => {
    const layers = [
      await makeGif(SIZE, [solid(GREEN), solid(BLUE)], 200),
      await makePng(SIZE, rect(WHITE, [0.4, 0.4, 0.6, 0.6])(SIZE)),
    ]
    const out = await decodeFrames((await composeLayers(layers)).buffer)
    expect(out.pages).toBe(2)
    expect(out.delay).toEqual([200, 200])
    expect(out.pixel(0, 0.5, 0.5)).toEqual(WHITE)
    expect(out.pixel(1, 0.5, 0.5)).toEqual(WHITE)
    expect(out.pixel(0, 0.1, 0.9)).toEqual(GREEN)
    expect(out.pixel(1, 0.1, 0.9)).toEqual(BLUE)
  })

  it('honours per-frame delays from the source GIF', async () => {
    const layers = [await makePng(SIZE, solid(BLUE)), await movingBox(3, [50, 150, 300])]
    const out = await decodeFrames((await composeLayers(layers)).buffer)
    expect(out.delay).toEqual([50, 150, 300])
  })

  it('normalises 0ms GIF delays to the 100ms browsers use', async () => {
    const layers = [await makePng(SIZE, solid(BLUE)), await movingBox(2, 0)]
    const out = await decodeFrames((await composeLayers(layers)).buffer)
    expect(out.delay).toEqual([100, 100])
  })

  it('runs two GIF layers with different frame counts on independent clocks', async () => {
    const layers = [
      await makeGif(SIZE, [solid(GREEN), solid(BLUE)], 100),
      await makeGif(
        SIZE,
        [0, 1, 2].map((i) => rect(RED, [i / 3, 0, (i + 1) / 3, 0.25])(SIZE)),
        100
      ),
    ]
    const result = await composeLayers(layers)
    const out = await decodeFrames(result.buffer)
    expect(out.pages).toBe(6) // lcm(2, 3)
    for (let f = 0; f < 6; f++) {
      expect(out.pixel(f, 0.5, 0.75)).toEqual(f % 2 === 0 ? GREEN : BLUE)
      expect(out.pixel(f, ((f % 3) + 0.5) / 3, 0.1)).toEqual(RED)
    }
  })

  it('keeps GIF transparency over a transparent base', async () => {
    const layers = [await makePng(SIZE, solid(TRANSPARENT)), await movingBox(2)]
    const out = await decodeFrames((await composeLayers(layers)).buffer)
    expect(out.pixel(0, 0.25, 0.1)).toEqual(RED)
    expect(out.pixel(0, 0.5, 0.75)[3]).toBe(0)
  })

  it('encodes animated webp when requested', async () => {
    const layers = [await makePng(SIZE, solid(BLUE)), await movingBox(3)]
    const result = await composeLayers(layers, { format: 'webp' })
    expect(result.contentType).toBe('image/webp')
    const out = await decodeFrames(result.buffer)
    expect(out.format).toBe('webp')
    expect(out.pages).toBe(3)
    expect(out.delay).toEqual([100, 100, 100])
  })

  it('returns the static first frame when forced', async () => {
    const layers = [await makePng(SIZE, solid(BLUE)), await movingBox(3)]
    const result = await composeLayers(layers, { forceStatic: true })
    expect(result.animated).toBe(false)
    expect(result.contentType).toBe('image/webp')
    expect(result.fallback).toBeUndefined()
    const out = await decodeFrames(result.buffer)
    expect(out.pages).toBe(1)
  })

  it('handles a non-square animated layer by centring it on the canvas', async () => {
    const animatedWide = await sharp(await movingBox(2), { animated: true })
      .resize(SIZE, SIZE / 2, { fit: 'fill' })
      .gif({ loop: 0, delay: [100, 100] })
      .toBuffer()
    const result = await composeLayers([await makePng(SIZE, solid(BLUE)), animatedWide])
    const out = await decodeFrames(result.buffer)
    expect(out.pages).toBe(2)
    expect([out.width, out.height]).toEqual([1080, 1080])
    // the strip occupies the vertical middle half; above it the base shows through
    expect(out.pixel(0, 0.25, 0.1)).toEqual(BLUE)
    expect(out.pixel(0, 0.25, 0.3)).toEqual(RED)
  })
})

describe('composeLayers — budgets and failures', () => {
  it('downsizes when the raw frame budget is exceeded', async () => {
    const layers = [await makePng(SIZE, solid(BLUE)), await movingBox(3)]
    // 3 output frames + 1 static layer + 3 GIF pages = 7 frame units; only 540² fits
    const result = await composeLayers(layers, {
      limits: { maxRawBytes: 7 * 540 * 540 * 4 },
    })
    expect(result.animated).toBe(true)
    expect(result.size).toBe(540)
    const out = await decodeFrames(result.buffer)
    expect([out.width, out.height]).toEqual([540, 540])
  })

  it('falls back to static when nothing fits the raw budget', async () => {
    const layers = [await makePng(SIZE, solid(BLUE)), await movingBox(3)]
    const result = await composeLayers(layers, { limits: { maxRawBytes: 1024 } })
    expect(result.animated).toBe(false)
    expect(result.fallback).toBe('memory-budget')
    expect(result.contentType).toBe('image/webp')
  })

  it('steps down until the output fits the byte budget, then falls back', async () => {
    const layers = [await makePng(SIZE, solid(BLUE)), await movingBox(3)]
    const full = await composeLayers(layers)
    const smaller = await composeLayers(layers, {
      limits: { maxOutputBytes: full.buffer.length - 1 },
    })
    expect(smaller.animated).toBe(true)
    expect(smaller.size).toBeLessThan(1080)
    expect(smaller.buffer.length).toBeLessThan(full.buffer.length)

    const none = await composeLayers(layers, { limits: { maxOutputBytes: 10 } })
    expect(none.animated).toBe(false)
    expect(none.fallback).toBe('output-budget')
  })

  it('caps the number of output frames', async () => {
    const layers = [
      await makePng(SIZE, solid(BLUE)),
      await makeGif(
        SIZE,
        Array.from({ length: 30 }, (_, i) => (i % 2 ? solid(RED) : solid(GREEN))),
        20
      ),
    ]
    const result = await composeLayers(layers, { limits: { maxFrames: 10 } })
    const out = await decodeFrames(result.buffer)
    expect(out.pages).toBeLessThanOrEqual(10)
    expect(out.delay!.reduce((a, b) => a + b, 0)).toBe(600)
  })

  it('still renders a truncated GIF layer', async () => {
    const gif = await movingBox(4)
    const truncated = gif.subarray(0, Math.floor(gif.length * 0.7))
    const result = await composeLayers([await makePng(SIZE, solid(BLUE)), truncated])
    expect(result.buffer.length).toBeGreaterThan(0)
    expect(['image/gif', 'image/webp']).toContain(result.contentType)
  })
})

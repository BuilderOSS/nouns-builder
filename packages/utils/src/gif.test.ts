import { describe, expect, it } from 'vitest'

import { GifParseError, isGif, normalizeGifDelay, parseGif } from './gif'

type FrameSpec = {
  /** delay in hundredths of a second; omit to skip the Graphic Control Extension */
  delayCs?: number
  localColorTable?: boolean
  interlaced?: boolean
  disposal?: number
}

const u16 = (n: number) => [n & 0xff, (n >> 8) & 0xff]

/** Builds a structurally valid GIF. Pixel data is a 1x1 LZW stream; the parser never decodes it. */
const buildGif = ({
  width = 4,
  height = 4,
  frames = [{}],
  loop,
  globalColorTable = true,
  version = '89a',
  extraBlocks = [],
}: {
  width?: number
  height?: number
  frames?: FrameSpec[]
  loop?: number
  globalColorTable?: boolean
  version?: '87a' | '89a'
  extraBlocks?: number[][]
}): Uint8Array => {
  const bytes: number[] = [...Array.from(`GIF${version}`, (c) => c.charCodeAt(0))]
  // Logical screen descriptor; GCT of 2 colours => size bits 0
  bytes.push(...u16(width), ...u16(height), globalColorTable ? 0x80 : 0x00, 0, 0)
  if (globalColorTable) bytes.push(0, 0, 0, 255, 255, 255)

  if (loop !== undefined) {
    bytes.push(0x21, 0xff, 11, ...Array.from('NETSCAPE2.0', (c) => c.charCodeAt(0)))
    bytes.push(3, 1, ...u16(loop), 0)
  }

  for (const block of extraBlocks) bytes.push(...block)

  for (const frame of frames) {
    if (frame.delayCs !== undefined) {
      const packed = ((frame.disposal ?? 0) & 0x07) << 2
      bytes.push(0x21, 0xf9, 4, packed, ...u16(frame.delayCs), 0, 0)
    }
    let packed = 0
    if (frame.localColorTable) packed |= 0x80 | 0x01 // 4 colours
    if (frame.interlaced) packed |= 0x40
    bytes.push(0x2c, ...u16(0), ...u16(0), ...u16(width), ...u16(height), packed)
    if (frame.localColorTable) bytes.push(...new Array(12).fill(7))
    bytes.push(2, 2, 0x44, 0x01, 0) // LZW min code size + one sub-block + terminator
  }

  bytes.push(0x3b)
  return new Uint8Array(bytes)
}

describe('isGif', () => {
  it('accepts GIF87a and GIF89a signatures', () => {
    expect(isGif(buildGif({ version: '87a' }))).toBe(true)
    expect(isGif(buildGif({ version: '89a' }))).toBe(true)
  })

  it('rejects other formats and short input', () => {
    expect(isGif(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]))).toBe(false)
    expect(isGif(new Uint8Array([0x47, 0x49, 0x46]))).toBe(false)
    expect(isGif(new TextEncoder().encode('GIF90a'))).toBe(false)
  })

  it('accepts ArrayBuffer input', () => {
    const gif = buildGif({})
    expect(isGif(gif.buffer.slice(0) as ArrayBuffer)).toBe(true)
  })
})

describe('normalizeGifDelay', () => {
  it('matches browser clamping of tiny delays to 100ms', () => {
    expect(normalizeGifDelay(0)).toBe(100)
    expect(normalizeGifDelay(10)).toBe(100)
    expect(normalizeGifDelay(20)).toBe(20)
    expect(normalizeGifDelay(70)).toBe(70)
  })
})

describe('parseGif', () => {
  it('reads dimensions and a single static frame', () => {
    const info = parseGif(buildGif({ width: 600, height: 600 }))
    expect(info).toMatchObject({
      width: 600,
      height: 600,
      frameCount: 1,
      isAnimated: false,
      duration: 0,
      loopCount: null,
      truncated: false,
    })
  })

  it('reads per-frame delays and loop count of an animated GIF', () => {
    const info = parseGif(
      buildGif({ frames: [{ delayCs: 5 }, { delayCs: 10 }, { delayCs: 25 }], loop: 0 })
    )
    expect(info.frameCount).toBe(3)
    expect(info.delays).toEqual([50, 100, 250])
    expect(info.duration).toBe(400)
    expect(info.loopCount).toBe(0)
    expect(info.isAnimated).toBe(true)
  })

  it('normalises zero delays in the total duration but keeps raw delays', () => {
    const info = parseGif(buildGif({ frames: [{ delayCs: 0 }, { delayCs: 1 }, {}] }))
    expect(info.delays).toEqual([0, 10, 0])
    expect(info.duration).toBe(300)
  })

  it('reports a finite loop count and no loop extension', () => {
    expect(parseGif(buildGif({ frames: [{}, {}], loop: 3 })).loopCount).toBe(3)
    expect(parseGif(buildGif({ frames: [{}, {}] })).loopCount).toBeNull()
  })

  it('handles local colour tables, interlacing and disposal methods', () => {
    const info = parseGif(
      buildGif({
        globalColorTable: false,
        frames: [
          { delayCs: 4, localColorTable: true, disposal: 2 },
          { delayCs: 4, localColorTable: true, interlaced: true, disposal: 3 },
        ],
      })
    )
    expect(info.frameCount).toBe(2)
    expect(info.delays).toEqual([40, 40])
  })

  it('skips comment, plain-text and unknown application extensions', () => {
    const comment = [0x21, 0xfe, 3, 0x61, 0x62, 0x63, 0]
    const xmp = [0x21, 0xff, 11, ...Array.from('XMP DataXMP', (c) => c.charCodeAt(0))]
    xmp.push(4, 1, 2, 3, 4, 0)
    const info = parseGif(
      buildGif({ frames: [{ delayCs: 2 }, { delayCs: 2 }], extraBlocks: [comment, xmp] })
    )
    expect(info.frameCount).toBe(2)
    expect(info.loopCount).toBeNull()
  })

  it('flags truncated files but keeps frames read so far', () => {
    const full = buildGif({ frames: [{ delayCs: 5 }, { delayCs: 5 }, { delayCs: 5 }] })
    const cut = full.subarray(0, full.length - 8)
    const info = parseGif(cut)
    expect(info.truncated).toBe(true)
    expect(info.frameCount).toBeGreaterThanOrEqual(2)
  })

  it('throws on non-GIF input, empty GIFs and corrupt block structure', () => {
    expect(() => parseGif(new Uint8Array([1, 2, 3]))).toThrow(GifParseError)

    const noFrames = buildGif({ frames: [] })
    expect(() => parseGif(noFrames)).toThrow(/no image frames/)

    const corrupt = buildGif({ frames: [{}, {}] })
    corrupt[13 + 6] = 0x99 // first block introducer after the GCT
    expect(() => parseGif(corrupt)).toThrow(/Unexpected block/)
  })

  it('does not hang on a sub-block chain that runs off the end', () => {
    const bytes = Array.from(buildGif({ frames: [{}] }))
    // Replace trailer with an extension whose sub-block size exceeds the buffer
    bytes.splice(bytes.length - 1, 1, 0x21, 0xfe, 200, 1, 2)
    const info = parseGif(new Uint8Array(bytes))
    expect(info.truncated).toBe(true)
    expect(info.frameCount).toBe(1)
  })
})

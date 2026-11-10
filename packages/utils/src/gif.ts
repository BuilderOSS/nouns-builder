/**
 * Minimal, dependency-free GIF inspector.
 *
 * Walks the GIF block structure (without decoding LZW image data) to report
 * dimensions, frame count, per-frame delays and loop count. Used for upload
 * validation in the browser and for cheap format sniffing on the server.
 */

export type GifInfo = {
  width: number
  height: number
  frameCount: number
  /** Raw per-frame delays in ms, as encoded in the file (0 when unset). */
  delays: number[]
  /** Total duration of one loop in ms, using browser-normalised delays. */
  duration: number
  /** NETSCAPE2.0 loop count: 0 = loop forever, null = no loop extension (plays once). */
  loopCount: number | null
  isAnimated: boolean
  /** True when the trailer was not reached (file cut short). */
  truncated: boolean
}

export class GifParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GifParseError'
  }
}

/** Browsers render delays of 0–10ms as 100ms; mirror that so timing matches what users see. */
export const MIN_BROWSER_GIF_DELAY_MS = 20
export const DEFAULT_BROWSER_GIF_DELAY_MS = 100

export const normalizeGifDelay = (ms: number): number =>
  ms < MIN_BROWSER_GIF_DELAY_MS ? DEFAULT_BROWSER_GIF_DELAY_MS : ms

const toBytes = (input: ArrayBuffer | Uint8Array): Uint8Array =>
  input instanceof Uint8Array ? input : new Uint8Array(input)

export const isGif = (input: ArrayBuffer | Uint8Array): boolean => {
  const b = toBytes(input)
  return (
    b.length >= 6 &&
    b[0] === 0x47 && // G
    b[1] === 0x49 && // I
    b[2] === 0x46 && // F
    b[3] === 0x38 && // 8
    (b[4] === 0x37 || b[4] === 0x39) && // 7 | 9
    b[5] === 0x61 // a
  )
}

const colorTableSize = (packed: number): number =>
  packed & 0x80 ? 3 * (1 << ((packed & 0x07) + 1)) : 0

export const parseGif = (input: ArrayBuffer | Uint8Array): GifInfo => {
  const b = toBytes(input)
  if (!isGif(b)) throw new GifParseError('Not a GIF file')
  if (b.length < 13) throw new GifParseError('GIF header is truncated')

  const u16 = (o: number) => b[o] | (b[o + 1] << 8)

  const width = u16(6)
  const height = u16(8)
  let pos = 13 + colorTableSize(b[10])

  const delays: number[] = []
  let pendingDelay = 0
  let loopCount: number | null = null
  let truncated = true

  // Skip a chain of data sub-blocks; returns the position after the 0 terminator,
  // or -1 if the data runs past the end of the buffer.
  const skipSubBlocks = (p: number): number => {
    while (p < b.length) {
      const size = b[p]
      if (size === 0) return p + 1
      p += size + 1
    }
    return -1
  }

  while (pos < b.length) {
    const introducer = b[pos]

    if (introducer === 0x3b) {
      truncated = false
      break
    }

    if (introducer === 0x21) {
      const label = b[pos + 1]
      const blockStart = pos + 2

      if (label === 0xf9 && b[blockStart] === 4 && blockStart + 5 <= b.length) {
        // Graphic Control Extension: delay in hundredths of a second
        pendingDelay = u16(blockStart + 2) * 10
      } else if (label === 0xff && b[blockStart] === 11 && blockStart + 12 <= b.length) {
        const appId = String.fromCharCode(...b.subarray(blockStart + 1, blockStart + 12))
        const sub = blockStart + 12
        if (
          (appId === 'NETSCAPE2.0' || appId === 'ANIMEXTS1.0') &&
          sub + 4 <= b.length &&
          b[sub] === 3 &&
          b[sub + 1] === 1
        ) {
          loopCount = u16(sub + 2)
        }
      }

      const next = skipSubBlocks(blockStart)
      if (next < 0) break
      pos = next
      continue
    }

    if (introducer === 0x2c) {
      if (pos + 10 > b.length) break
      const packed = b[pos + 9]
      // descriptor (10) + local colour table + LZW min code size (1)
      const dataStart = pos + 10 + colorTableSize(packed) + 1
      if (dataStart > b.length) break

      delays.push(pendingDelay)
      pendingDelay = 0

      const next = skipSubBlocks(dataStart)
      if (next < 0) break
      pos = next
      continue
    }

    throw new GifParseError(
      `Unexpected block 0x${introducer.toString(16).padStart(2, '0')} at byte ${pos}`
    )
  }

  if (delays.length === 0) throw new GifParseError('GIF contains no image frames')

  const frameCount = delays.length
  const isAnimated = frameCount > 1

  return {
    width,
    height,
    frameCount,
    delays,
    duration: isAnimated ? delays.reduce((sum, d) => sum + normalizeGifDelay(d), 0) : 0,
    loopCount,
    isAnimated,
    truncated,
  }
}

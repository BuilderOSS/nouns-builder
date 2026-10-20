/**
 * Test-only helpers that synthesise PNG/GIF/SVG layers with sharp so renderer
 * tests don't depend on committed binary fixtures.
 */
import sharp from 'sharp'

export type RGBA = [number, number, number, number]
export type Painter = (x: number, y: number) => RGBA

export const TRANSPARENT: RGBA = [0, 0, 0, 0]
export const RED: RGBA = [255, 0, 0, 255]
export const GREEN: RGBA = [0, 255, 0, 255]
export const BLUE: RGBA = [0, 0, 255, 255]
export const WHITE: RGBA = [255, 255, 255, 255]

export const solid =
  (color: RGBA): Painter =>
  () =>
    color

/** Paints `color` inside the rect (fractions of the image size), `bg` elsewhere. */
export const rect =
  (
    color: RGBA,
    [x0, y0, x1, y1]: [number, number, number, number],
    bg: RGBA = TRANSPARENT
  ) =>
  (size: number): Painter =>
  (x, y) =>
    x >= x0 * size && x < x1 * size && y >= y0 * size && y < y1 * size ? color : bg

const paint = (size: number, painter: Painter, target: Buffer, offset: number) => {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = offset + (y * size + x) * 4
      const [r, g, b, a] = painter(x, y)
      target[i] = r
      target[i + 1] = g
      target[i + 2] = b
      target[i + 3] = a
    }
  }
}

export const makePng = async (size: number, painter: Painter): Promise<Buffer> => {
  const data = Buffer.alloc(size * size * 4)
  paint(size, painter, data, 0)
  return sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toBuffer()
}

export const makeGif = async (
  size: number,
  frames: Painter[],
  delay: number | number[] = 100,
  loop = 0
): Promise<Buffer> => {
  const frameBytes = size * size * 4
  const data = Buffer.alloc(frameBytes * frames.length)
  frames.forEach((painter, i) => paint(size, painter, data, i * frameBytes))
  return (
    sharp(data, {
      raw: { width: size, height: size * frames.length, channels: 4, pageHeight: size },
    })
      // sharp applies a scalar delay to the first frame only, so always pass one per frame
      .gif({
        delay: Array.isArray(delay) ? delay : frames.map(() => delay),
        loop,
        dither: 0,
      })
      .toBuffer()
  )
}

export const makeSvg = (size: number, color = '#ffffff') =>
  Buffer.from(
    `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect x="${size / 4}" y="${size / 4}" width="${size / 2}" height="${size / 2}" fill="${color}"/></svg>`
  )

export type DecodedFrames = {
  width: number
  height: number
  pages: number
  delay?: number[]
  loop?: number
  format?: string
  pixel: (frame: number, xFrac: number, yFrac: number) => RGBA
}

export const decodeFrames = async (buffer: Buffer): Promise<DecodedFrames> => {
  const meta = await sharp(buffer, { animated: true }).metadata()
  const { data, info } = await sharp(buffer, { animated: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const pages = meta.pages ?? 1
  const height = meta.pageHeight ?? info.height
  const width = info.width
  return {
    width,
    height,
    pages,
    delay: meta.delay,
    loop: meta.loop,
    format: meta.format,
    pixel: (frame, xFrac, yFrac) => {
      const x = Math.floor(xFrac * width)
      const y = Math.floor(yFrac * height)
      const i = ((frame * height + y) * width + x) * 4
      return [data[i], data[i + 1], data[i + 2], data[i + 3]]
    },
  }
}

import { describe, expect, it } from 'vitest'

import {
  areArtworkMimeTypesCompatible,
  artworkUriToMimeType,
  GIF_ARTWORK_LIMITS,
  isArtworkMimeType,
  mimeToArtworkExtension,
  validateGifArtwork,
} from './artworkFiles'

const u16 = (n: number) => [n & 0xff, (n >> 8) & 0xff]

/** Minimal structurally-valid GIF with `frames` frames of `delayCs` hundredths each. */
const gif = (frames: number, delayCs = 10, { trailer = true } = {}) => {
  const bytes = [...Array.from('GIF89a', (c) => c.charCodeAt(0))]
  bytes.push(...u16(8), ...u16(8), 0x80, 0, 0, 0, 0, 0, 255, 255, 255)
  for (let i = 0; i < frames; i++) {
    bytes.push(0x21, 0xf9, 4, 0, ...u16(delayCs), 0, 0)
    bytes.push(0x2c, 0, 0, 0, 0, ...u16(8), ...u16(8), 0, 2, 2, 0x44, 0x01, 0)
  }
  if (trailer) bytes.push(0x3b)
  return new Uint8Array(bytes)
}

describe('artwork mime helpers', () => {
  it('accepts png, svg and gif', () => {
    expect(isArtworkMimeType('image/png')).toBe(true)
    expect(isArtworkMimeType('image/svg+xml')).toBe(true)
    expect(isArtworkMimeType('image/gif')).toBe(true)
    expect(isArtworkMimeType('image/jpeg')).toBe(false)
    expect(isArtworkMimeType('image/webp')).toBe(false)
  })

  it('maps mime types to on-chain extensions', () => {
    expect(mimeToArtworkExtension('image/png')).toBe('.png')
    expect(mimeToArtworkExtension('image/svg+xml')).toBe('.svg')
    expect(mimeToArtworkExtension('image/gif')).toBe('.gif')
  })

  it('infers mime types from on-chain item URIs', () => {
    expect(artworkUriToMimeType('ipfs://cid/heads/cat.png')).toBe('image/png')
    expect(artworkUriToMimeType('ipfs://cid/heads/cat.GIF')).toBe('image/gif')
    expect(artworkUriToMimeType('ipfs://cid/heads/cat.svg')).toBe('image/svg+xml')
    expect(artworkUriToMimeType('ipfs://cid/heads/cat.jpg')).toBeUndefined()
    expect(artworkUriToMimeType('ipfs://cid/heads/cat')).toBeUndefined()
  })

  it('allows mixing PNG and GIF but not SVG with raster types', () => {
    expect(areArtworkMimeTypesCompatible(['image/png', 'image/png'])).toBe(true)
    expect(areArtworkMimeTypesCompatible(['image/png', 'image/gif'])).toBe(true)
    expect(areArtworkMimeTypesCompatible(['image/svg+xml', 'image/svg+xml'])).toBe(true)
    expect(areArtworkMimeTypesCompatible(['image/svg+xml', 'image/png'])).toBe(false)
    expect(areArtworkMimeTypesCompatible(['image/gif', 'image/svg+xml'])).toBe(false)
    expect(areArtworkMimeTypesCompatible([])).toBe(true)
  })
})

describe('validateGifArtwork', () => {
  it('accepts a GIF within limits', () => {
    expect(validateGifArtwork(gif(10), 'ok.gif')).toBeUndefined()
    expect(validateGifArtwork(gif(1), 'static.gif')).toBeUndefined()
  })

  it('rejects too many frames', () => {
    expect(
      validateGifArtwork(gif(GIF_ARTWORK_LIMITS.maxFrames + 1, 2), 'many.gif')
    ).toMatch(/121 frames/)
  })

  it('rejects loops longer than the duration limit', () => {
    expect(validateGifArtwork(gif(11, 100), 'long.gif')).toMatch(/11\.0s/)
  })

  it('rejects oversized files', () => {
    const big = new Uint8Array(GIF_ARTWORK_LIMITS.maxBytes + 1)
    expect(validateGifArtwork(big, 'big.gif')).toMatch(/at most 5MB/)
  })

  it('rejects invalid and truncated GIFs', () => {
    expect(validateGifArtwork(new Uint8Array([1, 2, 3]), 'x.gif')).toMatch(
      /not a valid GIF/
    )
    expect(validateGifArtwork(gif(3, 10, { trailer: false }), 'cut.gif')).toMatch(
      /truncated/
    )
  })
})

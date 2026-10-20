import { describe, expect, it } from 'vitest'

import { chooseOutputSize, DEFAULT_LIMITS, nextSizeForByteBudget } from './limits'

const MB = 1024 * 1024

describe('chooseOutputSize', () => {
  it('uses full size when the frame budget allows', () => {
    expect(chooseOutputSize(10, DEFAULT_LIMITS)).toBe(1080)
  })

  it('steps down as frame count grows', () => {
    // 1080² * 4 ≈ 4.45MB per frame → 57 frames fit in 256MB, 58 do not
    expect(chooseOutputSize(57, DEFAULT_LIMITS)).toBe(1080)
    expect(chooseOutputSize(58, DEFAULT_LIMITS)).toBe(900)
    expect(chooseOutputSize(200, DEFAULT_LIMITS)).toBe(540)
  })

  it('returns null when even the smallest size does not fit', () => {
    expect(chooseOutputSize(1000, DEFAULT_LIMITS)).toBeNull()
  })

  it('respects a maximum size', () => {
    expect(chooseOutputSize(1, DEFAULT_LIMITS, 720)).toBe(720)
  })
})

describe('nextSizeForByteBudget', () => {
  it('jumps straight to a size expected to fit', () => {
    // 4x over budget → roughly half the edge length
    expect(nextSizeForByteBudget(1080, 16 * MB, DEFAULT_LIMITS)).toBe(540)
    // slightly over → next step down
    expect(nextSizeForByteBudget(1080, 4.2 * MB, DEFAULT_LIMITS)).toBe(900)
  })

  it('returns null at the smallest size', () => {
    expect(nextSizeForByteBudget(540, 8 * MB, DEFAULT_LIMITS)).toBeNull()
  })
})

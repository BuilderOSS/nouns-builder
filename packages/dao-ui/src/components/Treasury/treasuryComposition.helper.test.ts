import { parseEther, parseUnits } from 'viem'
import { describe, expect, it } from 'vitest'

import {
  computeDonutArcs,
  formatTokenAmount,
  formatUsd,
  sliceColor,
  tokenUsdValue,
} from './treasuryComposition.helper'

describe('tokenUsdValue', () => {
  it('values stables 1:1', () => {
    expect(tokenUsdValue(parseUnits('1500', 6), 6, 'stable', 3000)).toBeCloseTo(1500)
  })

  it('values WETH at the ETH price', () => {
    expect(tokenUsdValue(parseEther('2'), 18, 'weth', 3000)).toBeCloseTo(6000)
  })

  it('values other tokens at 0 (balance-only)', () => {
    expect(tokenUsdValue(parseEther('999'), 18, 'other', 3000)).toBe(0)
  })
})

describe('formatUsd', () => {
  it('compacts thousands and millions', () => {
    expect(formatUsd(1234)).toBe('$1.2k')
    expect(formatUsd(2_500_000)).toBe('$2.5M')
    expect(formatUsd(42)).toBe('$42')
  })
})

describe('formatTokenAmount', () => {
  it('formats whole and fractional amounts, trimming zeros', () => {
    expect(formatTokenAmount(parseUnits('13381.55', 6), 6)).toBe('13,381.55')
    expect(formatTokenAmount(parseEther('0.0282'), 18)).toBe('0.0282')
    expect(formatTokenAmount(0n, 18)).toBe('0')
  })
})

describe('computeDonutArcs', () => {
  it('produces arcs that tile the ring in order without gaps', () => {
    const C = 100
    const arcs = computeDonutArcs(
      [
        { name: 'A', color: '#000', value: 1 },
        { name: 'B', color: '#111', value: 3 },
      ],
      C
    )
    // A = 25% => len 25 at offset 0; B = 75% => len 75 at offset -25
    expect(arcs[0].dashArray).toBe('25.000 75.000')
    expect(arcs[0].dashOffset).toBe(0)
    expect(arcs[1].dashArray).toBe('75.000 25.000')
    expect(arcs[1].dashOffset).toBe(-25)
  })

  it('handles an all-zero total without dividing by zero', () => {
    const arcs = computeDonutArcs([{ name: 'A', color: '#000', value: 0 }], 100)
    expect(arcs[0].dashArray).toBe('0.000 100.000')
  })
})

describe('sliceColor', () => {
  it('uses known colors and falls back for unknowns', () => {
    expect(sliceColor('USDC', 0)).toBe('#2ecc8f')
    expect(sliceColor('WETH', 1)).toBe('#9a9aa2')
    expect(sliceColor('RANDOM', 0)).toBe('#ffb347')
  })
})

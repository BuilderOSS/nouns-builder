import { describe, expect, it } from 'vitest'

import {
  distributableBalance,
  distributorFeePercent,
  formatSplitPercent,
  toSplitAllocations,
} from './splitPayout.helper'

const A = '0x00000000000000000000000000000000000000aa' as const
const B = '0x00000000000000000000000000000000000000bb' as const
const C = '0x00000000000000000000000000000000000000cc' as const

describe('toSplitAllocations', () => {
  it('pairs accounts with allocations, largest share first', () => {
    const rows = toSplitAllocations({
      accounts: [A, B, C],
      percentAllocations: [250_000, 600_000, 150_000],
      distributorFee: 0,
    })

    expect(rows.map((r) => r.account)).toEqual([B, A, C])
    expect(rows.map((r) => r.percent)).toEqual([60, 25, 15])
  })

  it('sums to 100% for a well-formed split', () => {
    const rows = toSplitAllocations({
      accounts: [A, B],
      percentAllocations: [333_333, 666_667],
      distributorFee: 0,
    })
    expect(rows.reduce((sum, r) => sum + r.percent, 0)).toBeCloseTo(100, 6)
  })

  it('returns nothing when the two arrays disagree', () => {
    // Positional data that doesn't line up isn't a split we can act on.
    expect(
      toSplitAllocations({
        accounts: [A, B],
        percentAllocations: [1_000_000],
        distributorFee: 0,
      })
    ).toEqual([])
    expect(
      toSplitAllocations({ accounts: [], percentAllocations: [], distributorFee: 0 })
    ).toEqual([])
  })
})

describe('distributorFeePercent', () => {
  it('scales against 1e6', () => {
    expect(distributorFeePercent(10_000)).toBe(1)
    expect(distributorFeePercent(0)).toBe(0)
  })
})

describe('formatSplitPercent', () => {
  it('keeps meaningful decimals and drops empty ones', () => {
    expect(formatSplitPercent(50)).toBe('50%')
    expect(formatSplitPercent(12.5)).toBe('12.5%')
    expect(formatSplitPercent(33.333333)).toBe('33.33%')
  })

  it('survives a non-finite value', () => {
    expect(formatSplitPercent(NaN)).toBe('0%')
  })
})

describe('distributableBalance', () => {
  it('ignores the wei SplitMain leaves behind', () => {
    expect(distributableBalance(1n)).toBe(0n)
    expect(distributableBalance(0n)).toBe(0n)
    expect(distributableBalance(1_000_000_000_000_000_001n)).toBe(
      1_000_000_000_000_000_000n
    )
  })
})

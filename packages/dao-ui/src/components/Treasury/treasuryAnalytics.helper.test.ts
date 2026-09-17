import { parseEther } from 'viem'
import { describe, expect, it } from 'vitest'

import {
  type AuctionDatum,
  buildChartPaths,
  buildYTicks,
  computeCumulativeRevenue,
  computeTreasuryMetrics,
} from './treasuryAnalytics.helper'

const wei = (eth: string) => parseEther(eth).toString()

const data: AuctionDatum[] = [
  { id: '2', endTime: 200, winningBidAmt: wei('2') },
  { id: '1', endTime: 100, winningBidAmt: wei('1') },
  { id: '3', endTime: 300, winningBidAmt: wei('0.5') },
]

describe('computeTreasuryMetrics', () => {
  it('aggregates revenue, count, average and highest sale', () => {
    const m = computeTreasuryMetrics(data)
    expect(m.totalRevenue).toBeCloseTo(3.5)
    expect(m.auctionsSettled).toBe(3)
    expect(m.averageWinningBid).toBeCloseTo(3.5 / 3)
    expect(m.highestSale).toBeCloseTo(2)
  })

  it('returns zeros for an empty window', () => {
    expect(computeTreasuryMetrics([])).toEqual({
      totalRevenue: 0,
      auctionsSettled: 0,
      averageWinningBid: 0,
      highestSale: 0,
    })
  })

  it('treats malformed wei amounts as zero', () => {
    const m = computeTreasuryMetrics([{ id: 'x', endTime: 1, winningBidAmt: 'nope' }])
    expect(m.totalRevenue).toBe(0)
    expect(m.auctionsSettled).toBe(1)
  })

  it('excludes no-bid (burned) auctions from the average, not the count', () => {
    const withBurns: AuctionDatum[] = [
      { id: '1', endTime: 100, winningBidAmt: wei('1') },
      { id: '2', endTime: 200, winningBidAmt: wei('3') },
      { id: '3', endTime: 300, winningBidAmt: '0' }, // no bids, NFT burned
      { id: '4', endTime: 400, winningBidAmt: '0' }, // no bids, NFT burned
    ]
    const m = computeTreasuryMetrics(withBurns)
    expect(m.totalRevenue).toBeCloseTo(4)
    expect(m.auctionsSettled).toBe(4) // count still reflects all settled auctions
    expect(m.averageWinningBid).toBeCloseTo(2) // 4 / 2 bidded, not 4 / 4
  })
})

describe('computeCumulativeRevenue', () => {
  it('sorts ascending by endTime and accumulates', () => {
    const series = computeCumulativeRevenue(data)
    expect(series.map((p) => p.endTime)).toEqual([100, 200, 300])
    expect(series.map((p) => Number(p.cumulative.toFixed(2)))).toEqual([1, 3, 3.5])
  })

  it('does not mutate the input array', () => {
    const input = [...data]
    computeCumulativeRevenue(input)
    expect(input.map((d) => d.id)).toEqual(['2', '1', '3'])
  })
})

describe('buildChartPaths', () => {
  it('returns empty paths for fewer than two points', () => {
    expect(buildChartPaths([{ endTime: 1, cumulative: 1 }], 100, 50)).toEqual({
      linePath: '',
      areaPath: '',
    })
  })

  it('anchors the first point at x=0 and the last at x=width', () => {
    const series = computeCumulativeRevenue(data)
    const { linePath, areaPath } = buildChartPaths(series, 300, 100)
    expect(linePath.startsWith('M 0.00')).toBe(true)
    expect(linePath).toContain('L 300.00')
    // area path closes back down to the baseline (y = height) and Z-closes
    expect(areaPath.endsWith('Z')).toBe(true)
    expect(areaPath).toContain('100')
  })
})

describe('buildYTicks', () => {
  it('returns divisions+1 ticks spanning 0..maxY inclusive', () => {
    const ticks = buildYTicks(10, 4)
    expect(ticks.map((t) => t.value)).toEqual([0, 2.5, 5, 7.5, 10])
    expect(ticks.map((t) => t.fraction)).toEqual([0, 0.25, 0.5, 0.75, 1])
  })

  it('handles a zero max', () => {
    const ticks = buildYTicks(0, 4)
    expect(ticks.every((t) => t.value === 0)).toBe(true)
    expect(ticks).toHaveLength(5)
  })
})

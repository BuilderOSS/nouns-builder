import { formatEther } from 'viem'

/** A settled auction datum as returned by the /api/auctionHistory endpoint. */
export interface AuctionDatum {
  id: string
  /** Auction end time, unix seconds. */
  endTime: number
  /** Winning bid amount, wei (string). */
  winningBidAmt: string
}

export interface TreasuryMetrics {
  /** Sum of all winning bids in the window, in ETH. */
  totalRevenue: number
  /** Count of settled auctions in the window. */
  auctionsSettled: number
  /** Mean winning bid in the window, in ETH (0 when none). */
  averageWinningBid: number
  /** Largest single winning bid in the window, in ETH. */
  highestSale: number
}

/** A point on the cumulative-revenue series. */
export interface RevenuePoint {
  endTime: number
  /** Cumulative ETH revenue up to and including this auction. */
  cumulative: number
}

const toEth = (wei: string): number => {
  try {
    return Number(formatEther(BigInt(wei)))
  } catch {
    return 0
  }
}

/** Aggregate headline treasury metrics from settled auctions. */
export const computeTreasuryMetrics = (data: AuctionDatum[]): TreasuryMetrics => {
  if (!data.length) {
    return { totalRevenue: 0, auctionsSettled: 0, averageWinningBid: 0, highestSale: 0 }
  }

  const amounts = data.map((d) => toEth(d.winningBidAmt))
  const totalRevenue = amounts.reduce((sum, v) => sum + v, 0)
  const auctionsSettled = data.length

  // Auctions with no bids are settled with the NFT burned (winningBid = null,
  // coerced to 0). Exclude them from the average so the "winning bid" mean
  // reflects auctions that actually sold, not the burn count.
  const winningAmounts = amounts.filter((v) => v > 0)

  return {
    totalRevenue,
    auctionsSettled,
    averageWinningBid: winningAmounts.length ? totalRevenue / winningAmounts.length : 0,
    highestSale: Math.max(...amounts),
  }
}

/** Build the cumulative-revenue time series, sorted ascending by endTime. */
export const computeCumulativeRevenue = (data: AuctionDatum[]): RevenuePoint[] => {
  const sorted = [...data].sort((a, b) => a.endTime - b.endTime)
  let running = 0
  return sorted.map((d) => {
    running += toEth(d.winningBidAmt)
    return { endTime: d.endTime, cumulative: running }
  })
}

export interface ChartPaths {
  /** SVG path for the revenue line. */
  linePath: string
  /** SVG path for the filled area beneath the line. */
  areaPath: string
}

/**
 * Map a cumulative-revenue series to SVG path strings within a
 * `width` x `height` viewBox. Pure — no DOM, deterministic for a given input.
 */
export const buildChartPaths = (
  points: RevenuePoint[],
  width: number,
  height: number
): ChartPaths => {
  if (points.length < 2) return { linePath: '', areaPath: '' }

  const xs = points.map((p) => p.endTime)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...points.map((p) => p.cumulative))

  const spanX = maxX - minX || 1
  const spanY = maxY || 1

  const coords = points.map((p) => ({
    x: ((p.endTime - minX) / spanX) * width,
    y: height - (p.cumulative / spanY) * height,
  }))

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(' ')

  const first = coords[0]
  const last = coords[coords.length - 1]
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${height} L ${first.x.toFixed(2)} ${height} Z`

  return { linePath, areaPath }
}

export interface YTick {
  /** Value at this tick, in ETH. */
  value: number
  /** Position from the baseline, 0 (bottom) → 1 (top). */
  fraction: number
}

/** Evenly spaced Y-axis ticks from 0 up to `maxY`, inclusive of both ends. */
export const buildYTicks = (maxY: number, divisions = 4): YTick[] => {
  const steps = Math.max(1, Math.floor(divisions))
  return Array.from({ length: steps + 1 }, (_, i) => {
    const fraction = i / steps
    return { value: maxY * fraction, fraction }
  })
}

import type { Address } from 'viem'

import { DEFAULT_CLANKER_TOTAL_SUPPLY } from './clankerCreator'
import { type DiscoveryPoolConfig, fdvToTick } from './shared'

export const DEFAULT_ZORA_TOTAL_SUPPLY = 1_000_000_000 // 1B tokens
export const DEFAULT_ZORA_TICK_SPACING = 200

// Zora-derived constants
const TICK_HALF_RANGE = 11_000 // ±11k ticks
const RANGE_FACTOR = Math.pow(1.0001, 2 * TICK_HALF_RANGE) // ≈ 9.024
const RANGE_FACTOR_SQRT = Math.sqrt(RANGE_FACTOR)

// 3-band discovery shape (matches SDK)
const NUM_DISCOVERY_POSITIONS = [11, 11, 11] as const
const MAX_DISCOVERY_SUPPLY_SHARES = [
  250000000000000000n, // 25%
  300000000000000000n, // 30%
  150000000000000000n, // 15%
] as const

/**
 * Build a Zora-like 3-band content pool config from a target FDV anchor.
 *
 * This mirrors the SDK pattern you observed:
 * - fixed-width log window (±11k ticks around the anchor)
 * - 3 bands, with band2 and band3 sharing the same upper tick
 * - internal breakpoints biased toward the low end (not equal thirds)
 *
 * Breakpoints (in tick-space) are approximately:
 *   lower: [min, min+8000, min+10000]
 *   upper: [min+10000, max, max]
 */
export function createContentPoolConfigFromTargetFdv(params: {
  currency: Address
  quoteTokenUsd: number
  targetFdvUsd: number
  tickSpacing?: number
}): DiscoveryPoolConfig {
  const {
    currency,
    quoteTokenUsd,
    targetFdvUsd,
    tickSpacing = DEFAULT_ZORA_TICK_SPACING,
  } = params

  if (!Number.isFinite(targetFdvUsd) || targetFdvUsd <= 0)
    throw new Error('targetFdvUsd must be positive')
  if (!Number.isFinite(quoteTokenUsd) || quoteTokenUsd <= 0)
    throw new Error('quoteTokenUsd must be positive')

  // 1) Compute FDV bounds using geometric spread
  const minFdvUsd = targetFdvUsd / RANGE_FACTOR_SQRT
  const maxFdvUsd = targetFdvUsd * RANGE_FACTOR_SQRT

  // 2) Convert to ticks
  const minTick = fdvToTick({
    fdvUsd: minFdvUsd,
    quoteTokenUsd,
    tickSpacing,
    totalSupply: DEFAULT_ZORA_TOTAL_SUPPLY,
  })
  const maxTick = fdvToTick({
    fdvUsd: maxFdvUsd,
    quoteTokenUsd,
    tickSpacing,
    totalSupply: DEFAULT_ZORA_TOTAL_SUPPLY,
  })

  // Defensive: ensure ordering even if rounding flips something
  const tMin = Math.min(minTick, maxTick)
  const tMax = Math.max(minTick, maxTick)

  // 3) Zora-like internal breakpoints (match your observed SDK example)
  const t1 = tMin + 80 * tickSpacing
  const t2 = tMin + 100 * tickSpacing

  if (!(tMin < t1 && t1 < t2 && t2 < tMax)) {
    throw new Error(
      `Invalid tick construction: expected tMin < t1 < t2 < tMax, got ${tMin}, ${t1}, ${t2}, ${tMax}`
    )
  }

  const lowerTicks = [tMin, t1, t2]
  const upperTicks = [t2, tMax, tMax]

  return {
    currency,
    lowerTicks,
    upperTicks,
    numDiscoveryPositions: [...NUM_DISCOVERY_POSITIONS],
    maxDiscoverySupplyShares: [...MAX_DISCOVERY_SUPPLY_SHARES],
  }
}

const MIN_FDV = 10_000
const MAX_FDV = 100_000

// FDV where you're halfway from min → max
const PIVOT_FDV = 500_000 // creator FDV where curve is meaningfully "mid"
// Steepness (0.5 = very gentle, 1 = moderate, 2 = steep)
const K = 1.2 // steepness (higher = reaches cap faster)

export function estimateTargetFdvUsd(params: { creatorFdvUsd: number }): number {
  const { creatorFdvUsd } = params
  if (!Number.isFinite(creatorFdvUsd) || creatorFdvUsd <= 0) {
    throw new Error('creatorFdvUsd must be a finite positive number')
  }

  const x = Math.pow(creatorFdvUsd / PIVOT_FDV, K)
  const y = MIN_FDV + (MAX_FDV - MIN_FDV) * (x / (1 + x)) // saturating curve

  return y
}

export function createContentPoolConfigWithClankerTokenAsCurrency(params: {
  currency: Address
  clankerTokenPriceUsd: number
  tickSpacing?: number
}): DiscoveryPoolConfig {
  const { currency, clankerTokenPriceUsd, tickSpacing } = params

  const creatorFdvUsd = clankerTokenPriceUsd * DEFAULT_CLANKER_TOTAL_SUPPLY

  const targetFdvUsd = estimateTargetFdvUsd({ creatorFdvUsd: creatorFdvUsd })

  return createContentPoolConfigFromTargetFdv({
    currency,
    quoteTokenUsd: clankerTokenPriceUsd,
    targetFdvUsd,
    tickSpacing,
  })
}

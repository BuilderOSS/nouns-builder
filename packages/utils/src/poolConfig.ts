import {
  type Address,
  decodeAbiParameters,
  encodeAbiParameters,
  getAbiItem,
  type Hex,
} from 'viem'

const LN_1_0001 = Math.log(1.0001)

// Hardcoded protocol constants
const TOTAL_SUPPLY = 1_000_000_000 // 1B tokens
const DEFAULT_TICK_SPACING = 60

// ---- Types ----

export type DiscoveryPoolConfig = {
  currency: Address
  lowerTicks: number[]
  upperTicks: number[]
  numDiscoveryPositions: number[]
  maxDiscoverySupplyShares: bigint[]
}

// Simple band descriptor from a base minFDV
type FdvBandMultiplier = {
  minMultiplier: number
  maxMultiplier: number
}

// ---- Shared helpers ----

function snapToTickSpacing(tick: number, tickSpacing: number): number {
  return Math.round(tick / tickSpacing) * tickSpacing
}

/**
 * Convert an FDV band in USD into Uniswap ticks for a given quote token.
 *
 * fdvMinUsd / fdvMaxUsd → fully diluted valuation band in USD
 * quoteTokenUsd → USD price of the quote token (e.g. ZORA or ETH)
 * tickSpacing → Uniswap tick spacing (e.g. 10, 60, 200)
 */
function fdvBandToTicks(params: {
  fdvMinUsd: number
  fdvMaxUsd: number
  quoteTokenUsd: number
  tickSpacing: number
}): { lowerTick: number; upperTick: number } {
  const { fdvMinUsd, fdvMaxUsd, quoteTokenUsd, tickSpacing } = params

  if (fdvMinUsd <= 0 || fdvMaxUsd <= 0) {
    throw new Error('FDV values must be positive.')
  }
  if (fdvMinUsd >= fdvMaxUsd) {
    throw new Error('fdvMinUsd must be less than fdvMaxUsd.')
  }
  if (quoteTokenUsd <= 0) {
    throw new Error('quoteTokenUsd must be positive.')
  }

  // Price per token in USD (FDV / total supply)
  const minPriceUsd = fdvMinUsd / TOTAL_SUPPLY
  const maxPriceUsd = fdvMaxUsd / TOTAL_SUPPLY

  // Price per token in quote token units
  const minPriceQuote = minPriceUsd / quoteTokenUsd
  const maxPriceQuote = maxPriceUsd / quoteTokenUsd

  if (minPriceQuote <= 0 || maxPriceQuote <= 0) {
    throw new Error('Computed quote-token prices must be positive.')
  }

  // Convert price in quote token to ticks:
  // price = 1.0001^tick  =>  tick = ln(price) / ln(1.0001)
  let lowerTick = Math.log(minPriceQuote) / LN_1_0001
  let upperTick = Math.log(maxPriceQuote) / LN_1_0001

  lowerTick = snapToTickSpacing(lowerTick, tickSpacing)
  upperTick = snapToTickSpacing(upperTick, tickSpacing)

  if (lowerTick >= upperTick) {
    throw new Error('Resulting lowerTick >= upperTick; check inputs or tickSpacing.')
  }

  return { lowerTick, upperTick }
}

/**
 * Convert a tick from one quote token to another using their USD prices.
 *
 * fromQuoteUsd → USD price of the original quote token (A)
 * toQuoteUsd   → USD price of the new quote token (B)
 *
 * Example: convert ZORA-quoted ticks to ETH-quoted ticks by
 * passing fromQuoteUsd = ZORA_USD, toQuoteUsd = ETH_USD.
 */
export function convertTickQuote(params: {
  tick: number
  fromQuoteUsd: number
  toQuoteUsd: number
  tickSpacing?: number
}): number {
  const { tick, fromQuoteUsd, toQuoteUsd, tickSpacing = DEFAULT_TICK_SPACING } = params

  if (fromQuoteUsd <= 0 || toQuoteUsd <= 0) {
    throw new Error('Quote token USD prices must be positive.')
  }

  // ratio = price_from / price_to
  // tick_to = tick_from + ln(ratio)/ln(1.0001)
  const ratio = fromQuoteUsd / toQuoteUsd
  const delta = Math.log(ratio) / LN_1_0001

  let newTick = tick + delta
  newTick = snapToTickSpacing(newTick, tickSpacing)

  return newTick
}

export function convertTicksQuoteArray(params: {
  ticks: number[]
  fromQuoteUsd: number
  toQuoteUsd: number
  tickSpacing?: number
}): number[] {
  const { ticks, ...rest } = params
  return ticks.map((t) => convertTickQuote({ tick: t, ...rest }))
}

// ---- Hardcoded discovery shapes ----

// 4-band CONTENT pool shape
const CONTENT_NUM_DISCOVERY_POSITIONS = [11, 11, 11, 11] as const
const CONTENT_MAX_DISCOVERY_SUPPLY_SHARES = [
  150000000000000000n, // 15%
  250000000000000000n, // 25%
  200000000000000000n, // 20%
  75000000000000000n, // 7.5%
] as const

// 3-band CREATOR pool shape
const CREATOR_NUM_DISCOVERY_POSITIONS = [11, 11, 11] as const
const CREATOR_MAX_DISCOVERY_SUPPLY_SHARES = [
  50000000000000000n, // 5%
  125000000000000000n, // 12.5%
  200000000000000000n, // 20%
] as const

// How we grow FDV bands from a single minFDV input.

// CONTENT: 4 bands, geometric-ish progression from minFDV
// Band 0: [1×,  2×]
// Band 1: [2×,  4×]
// Band 2: [4×,  8×]
// Band 3: [8×, 16×]
const CONTENT_FDV_MULTIPLIERS: FdvBandMultiplier[] = [
  { minMultiplier: 1, maxMultiplier: 2 },
  { minMultiplier: 2, maxMultiplier: 4 },
  { minMultiplier: 4, maxMultiplier: 8 },
  { minMultiplier: 8, maxMultiplier: 16 },
]

// CREATOR: 3 bands, slightly tighter growth
// Band 0: [1×,  3×]
// Band 1: [3×,  6×]
// Band 2: [6×, 10×]
const CREATOR_FDV_MULTIPLIERS: FdvBandMultiplier[] = [
  { minMultiplier: 1, maxMultiplier: 3 },
  { minMultiplier: 3, maxMultiplier: 6 },
  { minMultiplier: 6, maxMultiplier: 10 },
]

// ---- Final factory methods ----

/**
 * Build a 4-band "content" pool config from a single minimum FDV in USD.
 *
 * - total supply is hardcoded to 1,000,000,000
 * - tick spacing is hardcoded to 60
 * - FDV bands are computed using CONTENT_FDV_MULTIPLIERS
 * - except the first upper tick, all other upper ticks are set equal
 */
export function createContentPoolConfigFromMinFdv(params: {
  currency: Address // quote token (ZORA, ETH, etc.)
  quoteTokenUsd: number // USD price of the quote token
  minFdvUsd: number // minimum FDV in USD for the first band
}): DiscoveryPoolConfig {
  const { currency, quoteTokenUsd, minFdvUsd } = params
  const tickSpacing = DEFAULT_TICK_SPACING

  if (minFdvUsd <= 0) {
    throw new Error('minFdvUsd must be positive.')
  }

  const lowerTicks: number[] = []
  const upperTicks: number[] = []

  // 1) Build fdv bands from minFdvUsd
  for (const band of CONTENT_FDV_MULTIPLIERS) {
    const fdvMinUsd = minFdvUsd * band.minMultiplier
    const fdvMaxUsd = minFdvUsd * band.maxMultiplier

    const { lowerTick, upperTick } = fdvBandToTicks({
      fdvMinUsd,
      fdvMaxUsd,
      quoteTokenUsd,
      tickSpacing,
    })

    lowerTicks.push(lowerTick)
    upperTicks.push(upperTick)
  }

  // 2) Apply "all upper ticks same except first" pattern
  if (upperTicks.length > 1) {
    const sharedUpper = upperTicks[upperTicks.length - 1] // highest band upper tick
    for (let i = 1; i < upperTicks.length; i++) {
      upperTicks[i] = sharedUpper
    }
  }

  return {
    currency,
    lowerTicks,
    upperTicks,
    numDiscoveryPositions: [...CONTENT_NUM_DISCOVERY_POSITIONS],
    maxDiscoverySupplyShares: [...CONTENT_MAX_DISCOVERY_SUPPLY_SHARES],
  }
}

/**
 * Build a 3-band "creator" pool config from a single minimum FDV in USD.
 *
 * - total supply is hardcoded to 1,000,000,000
 * - tick spacing is hardcoded to 60
 * - FDV bands are computed using CREATOR_FDV_MULTIPLIERS
 * - except the first upper tick, all other upper ticks are set equal
 */
export function createCreatorPoolConfigFromMinFdv(params: {
  currency: Address // quote token (ZORA, ETH, etc.)
  quoteTokenUsd: number // USD price of the quote token
  minFdvUsd: number // minimum FDV in USD for the first band
}): DiscoveryPoolConfig {
  const { currency, quoteTokenUsd, minFdvUsd } = params
  const tickSpacing = DEFAULT_TICK_SPACING

  if (minFdvUsd <= 0) {
    throw new Error('minFdvUsd must be positive.')
  }

  const lowerTicks: number[] = []
  const upperTicks: number[] = []

  // 1) Build fdv bands from minFdvUsd
  for (const band of CREATOR_FDV_MULTIPLIERS) {
    const fdvMinUsd = minFdvUsd * band.minMultiplier
    const fdvMaxUsd = minFdvUsd * band.maxMultiplier

    const { lowerTick, upperTick } = fdvBandToTicks({
      fdvMinUsd,
      fdvMaxUsd,
      quoteTokenUsd,
      tickSpacing,
    })

    lowerTicks.push(lowerTick)
    upperTicks.push(upperTick)
  }

  // 2) Apply "all upper ticks same except first" pattern
  if (upperTicks.length > 1) {
    const sharedUpper = upperTicks[upperTicks.length - 1] // highest band upper tick
    for (let i = 1; i < upperTicks.length; i++) {
      upperTicks[i] = sharedUpper
    }
  }

  return {
    currency,
    lowerTicks,
    upperTicks,
    numDiscoveryPositions: [...CREATOR_NUM_DISCOVERY_POSITIONS],
    maxDiscoverySupplyShares: [...CREATOR_MAX_DISCOVERY_SUPPLY_SHARES],
  }
}

export const poolConfigEncodingABI = [
  {
    type: 'function',
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8' },
      { name: 'currency', internalType: 'address', type: 'address' },
      { name: 'tickLower', internalType: 'int24[]', type: 'int24[]' },
      { name: 'tickUpper', internalType: 'int24[]', type: 'int24[]' },
      {
        name: 'numDiscoveryPositions',
        internalType: 'uint16[]',
        type: 'uint16[]',
      },
      {
        name: 'maxDiscoverySupplyShare',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
    ],
    name: 'encodeMultiCurvePoolConfig',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'pure',
  },
] as const

export type PoolConfig = {
  version: number
  currency: Address
  tickLower: number[]
  tickUpper: number[]
  numDiscoveryPositions: number[]
  maxDiscoverySupplyShare: bigint[]
}

export const decodePoolConfig = (data: Hex): PoolConfig => {
  const abiItem = getAbiItem({
    abi: poolConfigEncodingABI,
    name: 'encodeMultiCurvePoolConfig',
  })

  const [
    version,
    currency,
    tickLower,
    tickUpper,
    numDiscoveryPositions,
    maxDiscoverySupplyShare,
  ] = decodeAbiParameters(abiItem.inputs, data)

  return {
    version: version,
    currency: currency as Address,
    tickLower: tickLower as number[],
    tickUpper: tickUpper as number[],
    numDiscoveryPositions: numDiscoveryPositions as number[],
    maxDiscoverySupplyShare: maxDiscoverySupplyShare as bigint[],
  }
}

export const encodePoolConfig = (config: DiscoveryPoolConfig): Hex => {
  const abiItem = getAbiItem({
    abi: poolConfigEncodingABI,
    name: 'encodeMultiCurvePoolConfig',
  })

  return encodeAbiParameters(abiItem.inputs, [
    1, // version
    config.currency,
    config.lowerTicks,
    config.upperTicks,
    config.numDiscoveryPositions,
    config.maxDiscoverySupplyShares,
  ])
}

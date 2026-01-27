import { clamp, fdvToTick, snapToTickSpacing } from './shared'

// Clanker Creator Coin constants
export const DEFAULT_CLANKER_TARGET_FDV = 6_364_000 // Geometric center of $27K-$1.5B
export const DEFAULT_CLANKER_TOTAL_SUPPLY = 100_000_000_000 // 100B tokens
const DEFAULT_CLANKER_TICK_SPACING = 200

// ---- Clanker-specific pool position generation ----

export type ClankerPoolPosition = {
  tickLower: number
  tickUpper: number
  positionBps: number
}

function assertStrictlyIncreasing(values: number[], label: string) {
  for (let i = 1; i < values.length; i++) {
    if (values[i] <= values[i - 1]) {
      throw new Error(
        `${label} must be strictly increasing: index ${i - 1} (${values[i - 1]}) >= index ${i} (${values[i]})`
      )
    }
  }
}

const TEMPLATE_ETH_USD = 2700

const CLANKER_PROJECT_TEMPLATE_TICKS = {
  min: -230_400,
  mid1: -214_000,
  mid2: -202_000,
  mid3: -155_000,
  mid4: -141_000,
  max: -120_000,
} as const

const CLANKER_PROJECT_TEMPLATE_POSITIONS: Array<{
  a: keyof typeof CLANKER_PROJECT_TEMPLATE_TICKS
  b: keyof typeof CLANKER_PROJECT_TEMPLATE_TICKS
  bps: number
}> = [
  { a: 'min', b: 'mid1', bps: 1000 },
  { a: 'mid1', b: 'mid3', bps: 5000 },
  { a: 'mid2', b: 'mid3', bps: 1500 },
  { a: 'mid3', b: 'max', bps: 2000 },
  { a: 'mid4', b: 'max', bps: 500 },
]

/**
 * Create 5 Clanker pool positions based on target FDV and geometric spread.
 * Distribution matches SDK's "Project" preset: [10%, 50%, 15%, 20%, 5%]
 *
 * Position layout (for default $6.364M target → $27K-$1.5B range):
 * 1. 10% LP: [$27K - $130K]
 * 2. 50% LP: [$130K - $50M]
 * 3. 15% LP: [$450K - $50M]
 * 4. 20% LP: [$50M - $1.5B]
 * 5. 5% LP:  [$200M - $1.5B]
 *
 * @param targetFdvUsd - Target fully diluted valuation in USD (geometric center)
 * @param quoteTokenUsd - USD price of paired token (e.g., ETH price)
 * @param tickSpacing - Uniswap tick spacing (default: 60)
 * @returns Array of 5 pool positions with ticks and basis points
 */
export function createClankerPoolPositionsFromTargetFdv(params: {
  targetFdvUsd: number
  quoteTokenUsd: number // ETH or any token you can price in USD
  tickSpacing?: number
  templateEthUsd?: number // optional override, default 2700
  targetFdvFloorUsd?: number
  targetFdvCapUsd?: number
}): ClankerPoolPosition[] {
  const {
    quoteTokenUsd,
    tickSpacing = DEFAULT_CLANKER_TICK_SPACING,
    templateEthUsd = TEMPLATE_ETH_USD,
    targetFdvFloorUsd = 250_000,
    targetFdvCapUsd = 100_000_000,
  } = params
  let { targetFdvUsd } = params

  if (targetFdvUsd <= 0) throw new Error('targetFdvUsd must be positive')
  if (quoteTokenUsd <= 0) throw new Error('quoteTokenUsd must be positive')
  if (templateEthUsd <= 0) throw new Error('templateEthUsd must be positive')

  // Clamp target FDV (safety rails)
  targetFdvUsd = clamp(targetFdvUsd, targetFdvFloorUsd, targetFdvCapUsd)

  // Compute center ticks
  const tickTemplateCenter = fdvToTick({
    fdvUsd: DEFAULT_CLANKER_TARGET_FDV,
    quoteTokenUsd: templateEthUsd,
    tickSpacing,
    totalSupply: DEFAULT_CLANKER_TOTAL_SUPPLY,
  })

  const tickDesiredCenter = fdvToTick({
    fdvUsd: targetFdvUsd,
    quoteTokenUsd,
    tickSpacing,
    totalSupply: DEFAULT_CLANKER_TOTAL_SUPPLY,
  })

  const delta = tickDesiredCenter - tickTemplateCenter

  // Shift template ticks
  const shifted: Record<keyof typeof CLANKER_PROJECT_TEMPLATE_TICKS, number> = {
    min: 0,
    mid1: 0,
    mid2: 0,
    mid3: 0,
    mid4: 0,
    max: 0,
  }

  for (const k of Object.keys(CLANKER_PROJECT_TEMPLATE_TICKS) as Array<
    keyof typeof CLANKER_PROJECT_TEMPLATE_TICKS
  >) {
    shifted[k] = snapToTickSpacing(CLANKER_PROJECT_TEMPLATE_TICKS[k] + delta, tickSpacing)
  }

  // Validate ordering
  const ladder = [
    shifted.min,
    shifted.mid1,
    shifted.mid2,
    shifted.mid3,
    shifted.mid4,
    shifted.max,
  ]
  assertStrictlyIncreasing(ladder, 'Shifted Clanker Project tick ladder')

  return CLANKER_PROJECT_TEMPLATE_POSITIONS.map((p) => ({
    tickLower: shifted[p.a],
    tickUpper: shifted[p.b],
    positionBps: p.bps,
  }))
}

export function clankerUsdFromSqrtPriceX96(params: {
  sqrtPriceX96: bigint
  currencyUsd: number
  isClankerToken0: boolean
  clankerDecimals?: number
  currencyDecimals?: number
}): number {
  const {
    sqrtPriceX96,
    currencyUsd,
    isClankerToken0,
    clankerDecimals = 18,
    currencyDecimals = 18,
  } = params

  const ratio_token1_per_token0 = Math.pow(Number(sqrtPriceX96) / 2 ** 96, 2)

  // Adjust for decimals for token1/token0 ratio
  const ratioAdj =
    ratio_token1_per_token0 * Math.pow(10, clankerDecimals - currencyDecimals)

  // If clanker is token0: ratioAdj = currency / clanker
  // If clanker is token1: ratioAdj = clanker / currency (inverted meaning)
  const currencyPerClanker = isClankerToken0 ? ratioAdj : 1 / ratioAdj

  return currencyPerClanker * currencyUsd
}

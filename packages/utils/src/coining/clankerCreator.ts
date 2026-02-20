import { clamp, fdvToTick, snapToTickSpacing } from './shared'

// Clanker Creator Coin constants
export const DEFAULT_CLANKER_TARGET_FDV = 6_364_000 // Geometric center of $27K-$1.5B
export const DEFAULT_CLANKER_TOTAL_SUPPLY = 100_000_000_000 // 100B tokens
export const DEFAULT_CLANKER_TICK_SPACING = 200

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

const CLANKER_PROJECT_TEMPLATE_TICKS = {
  min: -230_400,
  mid1: -214_000,
  mid2: -202_000,
  mid3: -155_000,
  mid4: -141_000,
  max: -120_000,
} as const

const TEMPLATE_CENTER_TICK = -175600

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

const CLANKER_PROJECT_TEMPLATE_OFFSETS = {
  min: CLANKER_PROJECT_TEMPLATE_TICKS.min - TEMPLATE_CENTER_TICK,
  mid1: CLANKER_PROJECT_TEMPLATE_TICKS.mid1 - TEMPLATE_CENTER_TICK,
  mid2: CLANKER_PROJECT_TEMPLATE_TICKS.mid2 - TEMPLATE_CENTER_TICK,
  mid3: CLANKER_PROJECT_TEMPLATE_TICKS.mid3 - TEMPLATE_CENTER_TICK,
  mid4: CLANKER_PROJECT_TEMPLATE_TICKS.mid4 - TEMPLATE_CENTER_TICK,
  max: CLANKER_PROJECT_TEMPLATE_TICKS.max - TEMPLATE_CENTER_TICK,
} as const

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
 * @returns Array of 5 pool positions with ticks and basis points
 */
export function createClankerPoolPositionsFromTargetFdv(params: {
  targetFdvUsd: number
  quoteTokenUsd: number
  targetFdvFloorUsd?: number
  targetFdvCapUsd?: number
}): ClankerPoolPosition[] {
  const {
    quoteTokenUsd,
    targetFdvFloorUsd = 250_000,
    targetFdvCapUsd = 100_000_000,
  } = params
  let { targetFdvUsd } = params

  if (targetFdvUsd <= 0) throw new Error('targetFdvUsd must be positive')
  if (quoteTokenUsd <= 0) throw new Error('quoteTokenUsd must be positive')

  const tickSpacing = DEFAULT_CLANKER_TICK_SPACING

  targetFdvUsd = clamp(targetFdvUsd, targetFdvFloorUsd, targetFdvCapUsd)

  const tickDesiredCenter = fdvToTick({
    fdvUsd: targetFdvUsd,
    quoteTokenUsd,
    tickSpacing,
    totalSupply: DEFAULT_CLANKER_TOTAL_SUPPLY,
  })

  const shifted = Object.fromEntries(
    (
      Object.keys(CLANKER_PROJECT_TEMPLATE_OFFSETS) as Array<
        keyof typeof CLANKER_PROJECT_TEMPLATE_OFFSETS
      >
    ).map((k) => [
      k,
      snapToTickSpacing(
        tickDesiredCenter + CLANKER_PROJECT_TEMPLATE_OFFSETS[k],
        tickSpacing
      ),
    ])
  ) as Record<keyof typeof CLANKER_PROJECT_TEMPLATE_OFFSETS, number>

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

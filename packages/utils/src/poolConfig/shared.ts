import type { Address } from 'viem'

const LN_1_0001 = Math.log(1.0001)

// ---- Types ----

export type DiscoveryPoolConfig = {
  currency: Address
  lowerTicks: number[]
  upperTicks: number[]
  numDiscoveryPositions: number[]
  maxDiscoverySupplyShares: bigint[]
}

export type PoolConfig = {
  version: number
  currency: Address
  tickLower: number[]
  tickUpper: number[]
  numDiscoveryPositions: number[]
  maxDiscoverySupplyShare: bigint[]
}

// ---- Shared helpers ----

export function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x))
}

export function snapToTickSpacing(tick: number, spacing: number): number {
  return Math.round(tick / spacing) * spacing
}

export function fdvToTick(params: {
  fdvUsd: number
  quoteTokenUsd: number
  tickSpacing: number
  totalSupply: number
}): number {
  const { fdvUsd, quoteTokenUsd, tickSpacing, totalSupply } = params
  if (fdvUsd <= 0) throw new Error('fdvUsd must be positive')
  if (quoteTokenUsd <= 0) throw new Error('quoteTokenUsd must be positive')
  if (totalSupply <= 0) throw new Error('totalSupply must be positive')

  // USD per coin
  const usdPerCoin = fdvUsd / totalSupply

  // currency per coin = (USD per coin) / (USD per currency)
  // In Uniswap: tick represents price of token0 (coin) in terms of token1 (currency)
  // e.g., ETH per COIN for an ETH/COIN pool
  const currencyPerCoin = usdPerCoin / quoteTokenUsd

  let tick = Math.log(currencyPerCoin) / LN_1_0001
  return snapToTickSpacing(tick, tickSpacing)
}

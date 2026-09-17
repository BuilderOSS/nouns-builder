import { formatUnits } from 'viem'

import type { TokenKind } from './treasuryTokens'

/**
 * USD value of a token balance. Prices are derived, not fetched per-token:
 *   - stables  → 1:1 with USD
 *   - WETH     → balance × ETH/USD price
 *   - other    → 0 (shown with a balance, but excluded from the USD total/donut)
 * This keeps valuation dependency-free and can't fail on long-tail tokens.
 */
export const tokenUsdValue = (
  balanceRaw: bigint,
  decimals: number,
  kind: TokenKind,
  ethUsdPrice: number
): number => {
  const human = Number(formatUnits(balanceRaw, decimals))
  if (kind === 'stable') return human
  if (kind === 'weth') return human * ethUsdPrice
  return 0
}

/** Compact USD, e.g. $1.2k / $3.4M. */
export const formatUsd = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

/** Human token amount, up to 4 fractional digits, trailing zeros trimmed. */
export const formatTokenAmount = (raw: bigint, decimals: number): string => {
  if (raw === 0n) return '0'
  const base = 10n ** BigInt(decimals)
  const whole = raw / base
  const fraction = raw % base
  if (fraction === 0n) return whole.toLocaleString('en-US')
  const fracStr = fraction
    .toString()
    .padStart(decimals, '0')
    .slice(0, 4)
    .replace(/0+$/, '')
  return fracStr
    ? `${whole.toLocaleString('en-US')}.${fracStr}`
    : whole.toLocaleString('en-US')
}

export interface DonutSlice {
  name: string
  color: string
  value: number
}

export interface DonutArc {
  /** stroke-dasharray "len gap" for this slice. */
  dashArray: string
  /** negative offset positioning this slice after the previous ones. */
  dashOffset: number
}

/**
 * Map slice values to SVG circle stroke-dasharray/offset arcs around a ring of
 * circumference `circumference`. Pure — deterministic for a given input.
 */
export const computeDonutArcs = (
  slices: DonutSlice[],
  circumference: number
): DonutArc[] => {
  const total = slices.reduce((s, x) => s + x.value, 0)
  let offset = 0
  return slices.map((s) => {
    const len = total > 0 ? (s.value / total) * circumference : 0
    const arc: DonutArc = {
      dashArray: `${len.toFixed(3)} ${(circumference - len).toFixed(3)}`,
      dashOffset: offset === 0 ? 0 : -offset,
    }
    offset += len
    return arc
  })
}

const SLICE_COLORS: Record<string, string> = {
  ETH: '#5b8def',
  WETH: '#9a9aa2',
  USDC: '#2ecc8f',
  USDT: '#26a17b',
  DAI: '#f4b731',
}
const FALLBACK_COLORS = ['#ffb347', '#c084fc', '#f472b6', '#34d399', '#60a5fa']

/** Stable color for a token symbol, falling back to a rotating palette. */
export const sliceColor = (symbol: string, fallbackIndex: number): string =>
  SLICE_COLORS[symbol.toUpperCase()] ??
  FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length]

import { SPLIT_PERCENTAGE_SCALE } from '@buildeross/constants/splits'
import type { AddressType } from '@buildeross/types'

export interface SplitAllocation {
  account: AddressType
  /** Raw allocation against 1e6, as stored on chain. */
  allocation: number
  /** Share of the split, 0-100. */
  percent: number
}

export interface SplitTerms {
  accounts: readonly AddressType[]
  percentAllocations: readonly number[]
  distributorFee: number
}

/**
 * Pair a split's accounts with their allocations, largest share first. The two
 * arrays come off the chain positionally, so a length mismatch means we decoded
 * something that isn't a split and the caller should treat it as unknown.
 */
export const toSplitAllocations = (terms: SplitTerms): SplitAllocation[] => {
  const { accounts, percentAllocations } = terms
  if (!accounts.length || accounts.length !== percentAllocations.length) return []

  return accounts
    .map((account, i) => ({
      account,
      allocation: Number(percentAllocations[i]),
      percent: (Number(percentAllocations[i]) / SPLIT_PERCENTAGE_SCALE) * 100,
    }))
    .sort((a, b) => b.allocation - a.allocation)
}

/**
 * The distributor fee is taken off the top before recipients are paid, so it is
 * worth showing when a split carries one. Most splits set it to zero.
 */
export const distributorFeePercent = (distributorFee: number): number =>
  (Number(distributorFee) / SPLIT_PERCENTAGE_SCALE) * 100

/** Trim trailing zeros so 12.5% stays 12.5% and 50.0% reads as 50%. */
export const formatSplitPercent = (percent: number): string => {
  if (!Number.isFinite(percent)) return '0%'
  const rounded = Math.round(percent * 100) / 100
  return `${rounded}%`
}

/**
 * `SplitMain` keeps one wei in the split as a gas optimisation, and reports
 * balances that include it. Showing that stray wei as distributable revenue is
 * noise, and distributing it is a no-op.
 */
export const distributableBalance = (balance: bigint): bigint =>
  balance > 1n ? balance - 1n : 0n

import { formatEther } from 'viem'

export interface RecentTx {
  dir: 'in' | 'out'
  title: string
  tag: string
  amountEth: number
  timestamp: number
  txHash?: string
}

export interface ProposalLike {
  proposalNumber: number
  title?: string | null
  values?: readonly (string | bigint)[] | null
  executed?: boolean | null
  executedAt?: number | string | null
  executionTransactionHash?: string | null
}

export interface AuctionLike {
  id: string
  endTime: number | string
  winningBid?: { amount?: string | null } | null
}

/** Sum a proposal's per-transaction `values` (ETH sent) into a single ETH amount. */
export const sumProposalValuesEth = (
  values?: readonly (string | bigint)[] | null
): number => {
  if (!values || values.length === 0) return 0
  try {
    const total = values.reduce<bigint>((sum, v) => sum + BigInt(v), 0n)
    return Number(formatEther(total))
  } catch {
    return 0
  }
}

const auctionNumber = (id: string): string => id.split(':').pop() || '?'

/**
 * Build the treasury "Recent transactions" feed: executed proposals are ETH
 * outflows (the amount is the sum of their tx `values`), settled auctions are
 * inflows (the winning bid). Merged newest-first and capped.
 */
export const deriveRecentTransactions = (
  proposals: readonly ProposalLike[],
  auctions: readonly AuctionLike[],
  limit = 12
): RecentTx[] => {
  const proposalTxs: RecentTx[] = proposals
    .filter((p) => !!p.executedAt)
    .map((p) => ({
      dir: 'out',
      title: p.title?.trim() || `Proposal ${p.proposalNumber}`,
      tag: `Prop #${p.proposalNumber}`,
      amountEth: sumProposalValuesEth(p.values),
      timestamp: Number(p.executedAt),
      txHash: p.executionTransactionHash ?? undefined,
    }))

  const auctionTxs: RecentTx[] = auctions
    .filter((a) => {
      try {
        return !!a.winningBid?.amount && BigInt(a.winningBid.amount) > 0n
      } catch {
        return false
      }
    })
    .map((a) => ({
      dir: 'in',
      title: `Auction #${auctionNumber(a.id)}`,
      tag: 'Auction settle',
      amountEth: Number(formatEther(BigInt(a.winningBid!.amount!))),
      timestamp: Number(a.endTime),
    }))

  return [...proposalTxs, ...auctionTxs]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
}

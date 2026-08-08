import { describe, expect, it } from 'vitest'

import {
  type AuctionLike,
  deriveRecentTransactions,
  type ProposalLike,
  sumProposalValuesEth,
} from './recentTransactions.helper'

const eth = (n: number) => BigInt(Math.round(n * 1e6)) * 10n ** 12n // n ETH in wei

describe('sumProposalValuesEth', () => {
  it('sums per-transaction values into ETH (Prop 65: 1.37 + 2.75 = 4.12)', () => {
    expect(
      sumProposalValuesEth([eth(1.37).toString(), eth(2.75).toString()])
    ).toBeCloseTo(4.12, 6)
  })
  it('returns 0 for empty / missing values', () => {
    expect(sumProposalValuesEth([])).toBe(0)
    expect(sumProposalValuesEth(null)).toBe(0)
  })
})

describe('deriveRecentTransactions', () => {
  const proposals: ProposalLike[] = [
    {
      proposalNumber: 65,
      title: 'Tech Pod Residency Renewal',
      values: [eth(1.37).toString(), eth(2.75).toString()],
      executed: true,
      executedAt: 3000,
      executionTransactionHash: '0xabc',
    },
    {
      proposalNumber: 64,
      title: '',
      values: [eth(2.4).toString()],
      executed: true,
      executedAt: 1000,
    },
    {
      // not executed → excluded
      proposalNumber: 66,
      title: 'Pending',
      values: [eth(9).toString()],
      executed: false,
      executedAt: null,
    },
  ]
  const auctions: AuctionLike[] = [
    { id: '0xtoken:762', endTime: 2000, winningBid: { amount: eth(0.025).toString() } },
    { id: '0xtoken:761', endTime: 500, winningBid: { amount: '0' } }, // no bid → excluded
  ]

  it('merges proposals (out) + auctions (in), newest-first', () => {
    const rows = deriveRecentTransactions(proposals, auctions)
    expect(rows.map((r) => r.dir)).toEqual(['out', 'in', 'out'])
    expect(rows[0].tag).toBe('Prop #65')
    expect(rows[1].title).toBe('Auction #762')
    expect(rows[2].tag).toBe('Prop #64')
  })

  it('computes signed amounts and labels correctly', () => {
    const [p65, a762, p64] = deriveRecentTransactions(proposals, auctions)
    expect(p65.amountEth).toBeCloseTo(4.12, 6)
    expect(p65.title).toBe('Tech Pod Residency Renewal')
    expect(a762.amountEth).toBeCloseTo(0.025, 6)
    expect(p64.title).toBe('Proposal 64') // empty title falls back
  })

  it('excludes non-executed proposals and no-bid auctions', () => {
    const rows = deriveRecentTransactions(proposals, auctions)
    expect(rows.find((r) => r.tag === 'Prop #66')).toBeUndefined()
    expect(rows.find((r) => r.tag === 'Auction #761')).toBeUndefined()
  })

  it('excludes an executed:false proposal even if it carries a timestamp', () => {
    const rows = deriveRecentTransactions(
      [
        {
          proposalNumber: 99,
          values: [eth(5).toString()],
          executed: false,
          executedAt: 4000,
        },
      ],
      []
    )
    expect(rows).toHaveLength(0)
  })

  it('caps to the limit', () => {
    const many: ProposalLike[] = Array.from({ length: 20 }, (_, i) => ({
      proposalNumber: i + 1,
      title: `P${i}`,
      values: [eth(1).toString()],
      executed: true,
      executedAt: i + 1,
    }))
    expect(deriveRecentTransactions(many, [], 5)).toHaveLength(5)
  })
})

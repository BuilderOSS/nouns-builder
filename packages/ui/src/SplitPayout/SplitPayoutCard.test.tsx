import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const useSplitPayout = vi.fn()

vi.mock('@buildeross/hooks', () => ({
  useSplitPayout: (args: unknown) => useSplitPayout(args),
  useEnsData: () => ({ displayName: undefined }),
  distributableBalance: (balance: bigint) => (balance > 1n ? balance - 1n : 0n),
  distributorFeePercent: (fee: number) => (fee / 1_000_000) * 100,
  formatSplitPercent: (percent: number) => `${Math.round(percent * 100) / 100}%`,
}))

vi.mock('../ContractButton', () => ({
  ContractButton: ({ children, disabled }: any) => (
    <button disabled={disabled}>{children}</button>
  ),
}))

import { SplitPayoutCard } from './SplitPayoutCard'

const SPLIT = '0x1111111111111111111111111111111111111111' as const
const A = '0x00000000000000000000000000000000000000aa' as const
const B = '0x00000000000000000000000000000000000000bb' as const

const base = {
  isSplit: true,
  recipients: [],
  distributorFee: 0,
  distributable: 0n,
  withdrawable: 0n,
  isLoading: false,
  distribute: vi.fn(),
  withdraw: vi.fn(),
  canDistribute: false,
  canWithdraw: false,
  isDistributing: false,
  isWithdrawing: false,
  txHash: undefined,
  error: null,
  splitsAppUrl: 'https://app.splits.org/accounts/x',
}

describe('SplitPayoutCard', () => {
  beforeEach(() => useSplitPayout.mockReset())

  it('renders nothing when the recipient is an ordinary address', () => {
    useSplitPayout.mockReturnValue({ ...base, isSplit: false })
    const { container } = render(
      <SplitPayoutCard chainId={8453} fundsRecipient={SPLIT} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the shares and what is waiting to be distributed', () => {
    useSplitPayout.mockReturnValue({
      ...base,
      recipients: [
        { account: A, allocation: 600_000, percent: 60 },
        { account: B, allocation: 400_000, percent: 40 },
      ],
      distributable: 1_500_000_000_000_000_001n,
      canDistribute: true,
    })

    render(<SplitPayoutCard chainId={8453} fundsRecipient={SPLIT} />)

    expect(screen.getByText('60%')).toBeTruthy()
    expect(screen.getByText('40%')).toBeTruthy()
    expect(screen.getByText(/1\.5/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Distribute' })).toBeTruthy()
  })

  it('offers a withdrawal only when the viewer has a balance', () => {
    useSplitPayout.mockReturnValue({
      ...base,
      recipients: [{ account: A, allocation: 1_000_000, percent: 100 }],
      withdrawable: 250_000_000_000_000_001n,
      canWithdraw: true,
    })

    render(<SplitPayoutCard chainId={8453} fundsRecipient={SPLIT} />)
    expect(screen.getByRole('button', { name: /Withdraw 0\.25 ETH/ })).toBeTruthy()
  })

  it('points at splits.org when the recipient list cannot be read', () => {
    useSplitPayout.mockReturnValue({ ...base, recipients: [] })

    render(<SplitPayoutCard chainId={8453} fundsRecipient={SPLIT} />)

    expect(screen.getByRole('link', { name: 'on splits.org' })).toBeTruthy()
    // Nothing to distribute with, so the action isn't offered at all.
    expect(screen.queryByRole('button', { name: /Distribute/ })).toBeNull()
  })
})

import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const useSplitPayout = vi.fn()
const useAccount = vi.fn()

vi.mock('wagmi', () => ({ useAccount: () => useAccount() }))

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
const CREATION_TX = `0x${'ab'.repeat(32)}`

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
  beforeEach(() => {
    useSplitPayout.mockReset()
    useAccount.mockReturnValue({ address: A })
  })

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

  it.each([undefined, SPLIT])(
    'shows public split details without payout controls for viewer %s',
    (address) => {
      useAccount.mockReturnValue({ address })
      useSplitPayout.mockReturnValue({
        ...base,
        recipients: [{ account: A, allocation: 1_000_000, percent: 100 }],
        withdrawable: 250_000_000_000_000_001n,
        canDistribute: true,
        canWithdraw: true,
        distributorFee: 10_000,
        creationTxHash: CREATION_TX,
      })

      render(<SplitPayoutCard chainId={8453} fundsRecipient={SPLIT} />)

      expect(screen.getByText('Revenue split contract')).toBeTruthy()
      expect(screen.getByText('100%')).toBeTruthy()
      expect(screen.getByText('Contract')).toBeTruthy()
      expect(screen.getByText('Creation txn')).toBeTruthy()
      expect(screen.getByRole('link', { name: /View split contract/ })).toHaveTextContent(
        '0x1111…1111'
      )
      expect(
        screen.getByRole('link', { name: /View creation transaction/ })
      ).toHaveTextContent('0xabab…abab')
      expect(
        screen.getByRole('link', { name: /View creation transaction/ })
      ).toHaveAttribute('title', CREATION_TX)
      expect(screen.getByRole('link', { name: /View split contract/ })).toHaveAttribute(
        'href',
        `https://basescan.org/address/${SPLIT}`
      )
      expect(screen.queryByRole('button')).toBeNull()
      expect(
        screen.getByRole('link', { name: /View creation transaction/ })
      ).toHaveAttribute('href', `https://basescan.org/tx/${CREATION_TX}`)
      expect(screen.queryByText(/Distribute funds to the shares above/)).toBeNull()
      expect(screen.queryByText(/goes to whoever pays/)).toBeNull()
    }
  )

  it('matches recipients case-insensitively without linking to payout transactions', () => {
    useAccount.mockReturnValue({ address: A.replace('aa', 'AA') })
    const txHash = `0x${'ab'.repeat(32)}`
    useSplitPayout.mockReturnValue({
      ...base,
      recipients: [{ account: A, allocation: 1_000_000, percent: 100 }],
      txHash,
    })

    render(<SplitPayoutCard chainId={8453} fundsRecipient={SPLIT} />)

    expect(screen.getByText('100%')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Nothing to distribute' })).toBeDisabled()
    expect(screen.getByText(/Distribute funds to the shares above/)).toBeTruthy()
    expect(screen.queryByRole('link', { name: /transaction/i })).toBeNull()
    expect(screen.getByRole('link', { name: /View split contract/ })).toBeTruthy()
  })
})

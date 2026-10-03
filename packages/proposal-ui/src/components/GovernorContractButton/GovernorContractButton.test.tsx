import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GovernorContractButton } from './GovernorContractButton'

const mockExecuteAppTransaction = vi.fn()
const mockSimulateContract = vi.fn()
const mockEstimateGas = vi.fn()

vi.mock('@buildeross/sdk/transaction', () => ({
  executeAppTransaction: (...args: unknown[]) => mockExecuteAppTransaction(...args),
}))

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useConfig: () => ({ state: {} }),
  }
})

vi.mock('wagmi/actions', () => ({
  estimateGas: (...args: unknown[]) => mockEstimateGas(...args),
  simulateContract: (...args: unknown[]) => mockSimulateContract(...args),
}))

vi.mock('@buildeross/stores', () => ({
  useChainStore: (selector: (state: { chain: { id: number } }) => unknown) =>
    selector({ chain: { id: 1 } }),
  useDaoStore: () => ({
    addresses: { governor: '0x0000000000000000000000000000000000000001' },
  }),
}))

vi.mock('swr', () => ({
  useSWRConfig: () => ({ mutate: vi.fn() }),
}))

vi.mock('@buildeross/sdk/subgraph', () => ({
  getProposal: vi.fn(),
}))

vi.mock('@buildeross/ui/ContractButton', () => ({
  ContractButton: ({ children, handleClick, disabled }: any) => (
    <button type="button" onClick={handleClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

describe('GovernorContractButton', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const address = '0x0000000000000000000000000000000000000001' as const
  const bytes32 = `0x${'00'.repeat(32)}` as const
  const props = {
    functionName: 'execute' as const,
    args: [[address], [0n], [bytes32], bytes32, address] as any,
    proposalId: '1',
    buttonText: 'Execute',
    onSuccess: vi.fn(),
  }

  it('shows a transaction failure to the user', async () => {
    const user = userEvent.setup()
    mockSimulateContract.mockRejectedValueOnce(
      new Error('Proposal is no longer executable')
    )

    render(<GovernorContractButton {...props} />)

    await user.click(screen.getByRole('button', { name: 'Execute' }))

    expect(
      await screen.findByText('Transaction failed: Proposal is no longer executable')
    ).toBeInTheDocument()
  })

  it('clears pending state when a Safe proposal is created', async () => {
    const user = userEvent.setup()
    mockSimulateContract.mockResolvedValueOnce({ request: {} })
    mockEstimateGas.mockResolvedValueOnce(100n)
    mockExecuteAppTransaction.mockResolvedValueOnce({
      kind: 'safe-proposed',
      hash: '0xhash',
    })

    render(<GovernorContractButton {...props} />)
    const button = screen.getByRole('button', { name: 'Execute' })

    await user.click(button)

    await waitFor(() => expect(button).not.toBeDisabled())
  })
})

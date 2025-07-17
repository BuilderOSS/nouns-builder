import { fireEvent, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { FOUNDRY_CHAIN } from 'src/test/fixtures/chain'
import { BUILDER_DAO } from 'src/test/fixtures/dao'
import { render } from 'src/test/utils'

import { Airdrop } from './Airdrop'

vi.mock('src/stores/useDaoStore', () => ({
  useDaoStore: vi.fn(),
}))

vi.mock('src/stores/useChainStore', () => ({
  useChainStore: vi.fn(),
}))

vi.mock('src/data/subgraph/sdk.generated', async () => {
  const mod = await vi.importActual<typeof import('src/data/subgraph/sdk.generated')>(
    'src/data/subgraph/sdk.generated'
  )
  return {
    ...mod,
    getSdk: vi.fn(() => ({
      getProposal: () => ({ proposals: [] }),
    })),
  }
})

describe('Airdrop', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render initially disabled airdrop form given a required upgrade', async () => {
    vi.mocked(useChainStore).mockReturnValue(FOUNDRY_CHAIN)
    vi.mocked(useDaoStore).mockReturnValue(BUILDER_DAO)

    render(<Airdrop />)

    await waitFor(
      () => expect(screen.queryByTestId('upgrade-card')).toBeInTheDocument(),
      { timeout: 5000 }
    )
    expect(screen.queryByTestId('upgrade-in-progress')).not.toBeInTheDocument()
    expect(screen.getByTestId('airdrop-form')).toBeDisabled()

    // queue upgrade
    const upgradeBtn = screen.getByTestId('upgrade-btn')
    fireEvent.click(upgradeBtn)
    await waitFor(() => {
      expect(screen.queryByTestId('upgrade-card')).not.toBeInTheDocument()
    })
    expect(screen.getByTestId('airdrop-form')).toBeEnabled()

    // fill in airdrop form and submit
    const recipient = screen.getByTestId('recipientAddress') as HTMLInputElement
    const amount = screen.getByTestId('amount') as HTMLInputElement
    const addTransactionBtn = screen.getByText(/Add Transaction to Queue/)

    fireEvent.change(recipient, {
      target: { value: '0x27B4a2eB472C280b17B79c315F79C522B038aFCF' },
    })
    fireEvent.change(amount, { target: { value: 5 } })
    expect(amount.value).toBe('5')
    expect(recipient.value).toBe('0x27B4a2eB472C280b17B79c315F79C522B038aFCF')

    fireEvent.click(addTransactionBtn)

    // form reset after submission
    await waitFor(() => expect(amount.value).toBe('0'))
    expect(recipient.value).toBe('')
  })
})

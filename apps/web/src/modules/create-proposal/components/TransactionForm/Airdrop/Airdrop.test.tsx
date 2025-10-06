import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useChainStore, useDaoStore } from 'src/stores'
import { FOUNDRY_CHAIN } from 'src/test/fixtures/chain'
import { BUILDER_DAO } from 'src/test/fixtures/dao'
import { render } from 'src/test/utils'
import { vi } from 'vitest'

import { Airdrop } from './Airdrop'

vi.mock('src/stores', () => ({
  useDaoStore: vi.fn(),
}))

vi.mock('src/stores', () => ({
  useChainStore: vi.fn(),
}))

vi.mock('@buildeross/sdk/subgraph', async () => {
  const mod = await vi.importActual<typeof import('@buildeross/sdk/subgraph')>(
    '@buildeross/sdk/subgraph'
  )
  return {
    ...mod,
    getSdk: vi.fn(() => ({
      getProposal: () => ({ proposals: [] }),
    })),
  }
})

// Mock Papa Parse to avoid issues in tests
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}))

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
    const recipient = screen.getByPlaceholderText('0x... or ENS name') as HTMLInputElement
    const amount = screen.getByDisplayValue(0) as HTMLInputElement
    const addTransactionBtn = screen.getByText(/Add Transaction to Queue/)

    fireEvent.change(recipient, {
      target: { value: '0x27B4a2eB472C280b17B79c315F79C522B038aFCF' },
    })
    fireEvent.change(amount, { target: { value: 5 } })
    expect(amount.value).toBe('5')
    expect(recipient.value).toBe('0x27B4a2eB472C280b17B79c315F79C522B038aFCF')

    fireEvent.click(addTransactionBtn)

    // form reset after submission - check for empty recipient
    await waitFor(() => {
      const recipientAfterSubmit = screen.getByPlaceholderText(
        '0x... or ENS name'
      ) as HTMLInputElement
      expect(recipientAfterSubmit.value).toBe('')
    })
    const amountAfterSubmit = screen.getByDisplayValue(0) as HTMLInputElement
    expect(amountAfterSubmit.value).toBe('0')
  })
})

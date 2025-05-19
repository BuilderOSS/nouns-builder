import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect } from 'vitest'

import { useChainStore } from 'src/stores/useChainStore'
import { FOUNDRY_CHAIN } from 'src/test/fixtures/chain'
import { render } from 'src/test/utils'

import AirdropForm from './AirdropForm'

vi.mock('src/stores/useChainStore', () => ({
  useChainStore: vi.fn(),
}))

describe('Airdrop form', () => {
  it('should render airdrop form with default values', () => {
    vi.mocked(useChainStore).mockReturnValue(FOUNDRY_CHAIN)
    render(<AirdropForm />)

    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Recipient Wallet Address/ENS')).toBeInTheDocument()
    expect(screen.getByText('Add Transaction to Queue')).toBeInTheDocument()
  })
})

describe('Airdrop form with errors', () => {
  it('should render airdrop form with invalid values and errors', async () => {
    vi.mocked(useChainStore).mockReturnValue(FOUNDRY_CHAIN)
    render(<AirdropForm />)

    const amountInput = screen.getByDisplayValue(0)
    const recipientInput = screen.getByPlaceholderText('0x...')

    fireEvent.focus(recipientInput)
    fireEvent.change(recipientInput, { target: { value: '0x69420' } })
    fireEvent.focusOut(recipientInput)
    fireEvent.focus(amountInput)
    fireEvent.change(amountInput, { target: { value: 0 } })
    fireEvent.focusOut(amountInput)

    await waitFor(() =>
      expect(screen.getByText('Recipient address is invalid.')).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(screen.getByText('Must be at least 1 token')).toBeInTheDocument()
    )
  })
})

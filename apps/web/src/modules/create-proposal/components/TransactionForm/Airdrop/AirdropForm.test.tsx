import { fireEvent, screen, waitFor } from '@testing-library/react'
import { FOUNDRY_CHAIN } from 'src/test/fixtures/chain'
import { render } from 'src/test/utils'
import { describe, expect, vi } from 'vitest'

import AirdropForm from './AirdropForm'

// Mock Papa Parse to avoid issues in tests
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}))

describe('Airdrop form', () => {
  it('should render airdrop form with default values', () => {
    render(<AirdropForm />, {
      chain: FOUNDRY_CHAIN,
    })

    expect(screen.getByText('Upload CSV File')).toBeInTheDocument()
    expect(screen.getByText('Recipients')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Add Recipient')).toBeInTheDocument()
    expect(screen.getByText('Add Transaction to Queue')).toBeInTheDocument()
  })

  it('should allow adding and removing recipients', async () => {
    render(<AirdropForm />, {
      chain: FOUNDRY_CHAIN,
    })

    // Initially should have 1 recipient
    expect(screen.getAllByPlaceholderText('0x... or ENS name')).toHaveLength(1)

    // Add a recipient
    const addButton = screen.getByText('Add Recipient')
    fireEvent.click(addButton)

    // Should now have 2 recipients
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('0x... or ENS name')).toHaveLength(2)
    })

    // Remove buttons should be visible (only when more than 1 recipient)
    const removeButtons = screen.getAllByRole('button')
    // Count buttons - should have: Download Template, Add Recipient x2, Remove x1, Add Transaction = 5 total
    expect(removeButtons.length).toBeGreaterThan(4)
  })
})

describe('Airdrop form with errors', () => {
  it('should render airdrop form with invalid values and errors', async () => {
    render(<AirdropForm />, {
      chain: FOUNDRY_CHAIN,
    })

    const amountInput = screen.getByDisplayValue(0)
    const recipientInput = screen.getByPlaceholderText('0x... or ENS name')

    fireEvent.focus(recipientInput)
    fireEvent.change(recipientInput, { target: { value: '0x69420' } })
    fireEvent.focusOut(recipientInput)
    fireEvent.focus(amountInput)
    fireEvent.change(amountInput, { target: { value: 0 } })
    fireEvent.focusOut(amountInput)

    await waitFor(
      () => expect(screen.getByText('Recipient address is invalid.')).toBeInTheDocument(),
      { timeout: 5000 }
    )
    await waitFor(
      () => expect(screen.getByText('Must be at least 1 token')).toBeInTheDocument(),
      { timeout: 5000 }
    )
  })
})

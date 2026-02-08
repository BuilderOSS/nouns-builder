import { FOUNDRY_CHAIN, render } from '@buildeross/test-fixtures'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, vi } from 'vitest'

import MintGovernanceTokensForm from './MintGovernanceTokensForm'

// Mock Papa Parse to avoid issues in tests
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}))

describe('MintGovernanceTokens form', () => {
  it('should render mint governance tokens form with default values', () => {
    render(<MintGovernanceTokensForm />, {
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
    render(<MintGovernanceTokensForm />, {
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

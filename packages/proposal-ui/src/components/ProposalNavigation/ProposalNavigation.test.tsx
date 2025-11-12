import { BUILDER_DAO, FOUNDRY_CHAIN, render } from '@buildeross/test-fixtures'
import { screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { ProposalNavigation } from './ProposalNavigation'

describe('Proposal Navigation', () => {
  it('should render the nav', async () => {
    render(<ProposalNavigation handleBack={vi.fn()} />, {
      chain: FOUNDRY_CHAIN,
      addresses: BUILDER_DAO,
    })

    // loading state, no image exists
    expect(screen.queryByTestId('dao-image')).not.toBeInTheDocument()

    await waitFor(() => expect(screen.getByText(/Builder/)).toBeInTheDocument(), {
      timeout: 5000,
    })
  })
})

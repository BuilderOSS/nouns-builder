import { screen, waitFor } from '@testing-library/react'
import { FOUNDRY_CHAIN } from 'src/test/fixtures/chain'
import { BUILDER_DAO } from 'src/test/fixtures/dao'
import { render } from 'src/test/utils'
import { vi } from 'vitest'

import { ProposalNavigation } from './ProposalNavigation'

vi.mock('next/router', () => ({ useRouter: vi.fn() }))

describe('Proposal Navigation', () => {
  it('should render the nav', async () => {
    render(<ProposalNavigation />, {
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

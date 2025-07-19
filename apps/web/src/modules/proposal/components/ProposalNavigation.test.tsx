import { screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { FOUNDRY_CHAIN } from 'src/test/fixtures/chain'
import { BUILDER_DAO } from 'src/test/fixtures/dao'
import { render } from 'src/test/utils'

import { ProposalNavigation } from './ProposalNavigation'

vi.mock('next/router', () => ({ useRouter: vi.fn() }))

vi.mock('src/stores/useDaoStore', () => ({
  useDaoStore: vi.fn(),
}))

vi.mock('src/stores/useChainStore', () => ({
  useChainStore: vi.fn(),
}))

describe('Proposal Navigation', () => {
  it('should render the nav', async () => {
    vi.mocked(useDaoStore).mockReturnValue({
      token: BUILDER_DAO.token,
      metadata: BUILDER_DAO.metadata,
    })

    vi.mocked(useChainStore).mockReturnValue(FOUNDRY_CHAIN)

    render(<ProposalNavigation />)

    // loading state, no image exists
    expect(screen.queryByTestId('dao-image')).not.toBeInTheDocument()

    await waitFor(() => expect(screen.getByText(/Builder/)).toBeInTheDocument(), {
      timeout: 5000,
    })
  })
})

import { BUILDER_DAO, FOUNDRY_CHAIN } from '@buildeross/test-fixtures'
import { render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { SWRConfig } from 'swr'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ParticipationHistory } from './ParticipationHistory'

const { mockProposals, mockSnapshots } = vi.hoisted(() => ({
  mockProposals: vi.fn(),
  mockSnapshots: vi.fn(),
}))

vi.mock('@buildeross/sdk/subgraph', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@buildeross/sdk/subgraph')>()
  return {
    ...actual,
    SubgraphSDK: {
      connect: () => ({ proposals: mockProposals, snapshots: mockSnapshots }),
    },
  }
})

vi.mock('@buildeross/stores', () => ({
  useDaoStore: (selector: (s: { addresses: typeof BUILDER_DAO }) => unknown) =>
    selector({ addresses: BUILDER_DAO }),
  useChainStore: (selector: (s: { chain: typeof FOUNDRY_CHAIN }) => unknown) =>
    selector({ chain: FOUNDRY_CHAIN }),
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
)

const renderHistory = () => render(<ParticipationHistory />, { wrapper: Wrapper })

const makeProposal = (proposalNumber: number, forVotes: number) => ({
  proposalNumber,
  title: `Proposal ${proposalNumber}`,
  forVotes,
  againstVotes: 0,
  abstainVotes: 0,
  timeCreated: String(1_700_000_000 + proposalNumber),
})

describe('ParticipationHistory', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders participation bars for recent proposals', async () => {
    mockProposals.mockResolvedValue({
      proposals: [makeProposal(3, 5), makeProposal(2, 4), makeProposal(1, 3)],
    })
    mockSnapshots.mockResolvedValue({ snapshots: [{ totalSupply: 10 }] })

    renderHistory()

    await waitFor(() =>
      expect(screen.getByTestId('participation-history')).toBeInTheDocument()
    )
    expect(screen.getAllByTestId('participation-bar')).toHaveLength(3)
    expect(screen.getByText('Proposal 3')).toBeInTheDocument()
    expect(screen.getByText('50.0% · 5 of 10 votes')).toBeInTheDocument()
  })

  it('renders nothing with fewer than two proposals', async () => {
    mockProposals.mockResolvedValue({ proposals: [makeProposal(1, 3)] })
    mockSnapshots.mockResolvedValue({ snapshots: [{ totalSupply: 10 }] })

    renderHistory()

    await waitFor(() =>
      expect(
        screen.queryByTestId('participation-history-loading')
      ).not.toBeInTheDocument()
    )
    expect(screen.queryByTestId('participation-history')).not.toBeInTheDocument()
  })

  it('renders nothing when the subgraph request fails', async () => {
    mockProposals.mockRejectedValue(new Error('boom'))

    renderHistory()

    await waitFor(() =>
      expect(
        screen.queryByTestId('participation-history-loading')
      ).not.toBeInTheDocument()
    )
    expect(screen.queryByTestId('participation-history')).not.toBeInTheDocument()
  })

  it('handles zero snapshot supply', async () => {
    mockProposals.mockResolvedValue({
      proposals: [makeProposal(2, 4), makeProposal(1, 3)],
    })
    mockSnapshots.mockResolvedValue({ snapshots: [{ totalSupply: 0 }] })

    renderHistory()

    await waitFor(() =>
      expect(screen.getByTestId('participation-history')).toBeInTheDocument()
    )
    expect(screen.getByText(/--% ·/)).toBeInTheDocument()
  })
})

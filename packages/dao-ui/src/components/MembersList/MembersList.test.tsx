import { daoActivityRequest, DaoVoter } from '@buildeross/sdk/subgraph'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import React from 'react'
import { SWRConfig } from 'swr'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MembersList } from './MembersList'

vi.mock('@buildeross/stores', () => ({
  useChainStore: (selector: (s: { chain: { id: number } }) => unknown) =>
    selector({ chain: { id: 1 } }),
  useDaoStore: () => ({
    addresses: { token: '0x1000000000000000000000000000000000000001' },
  }),
}))

vi.mock('axios', () => ({ default: { get: vi.fn() } }))

vi.mock('@buildeross/sdk/subgraph', () => ({ daoActivityRequest: vi.fn() }))

vi.mock('@buildeross/hooks/useEnsData', () => ({
  useEnsData: (address?: string) => ({
    displayName: address,
    ensName: undefined,
    ensAvatar: undefined,
    ethAddress: address,
    isLoading: false,
    error: undefined,
  }),
}))

const activeAddress = '0xaaa0000000000000000000000000000000000001'
const inactiveAddress = '0xbbb0000000000000000000000000000000000002'

// Active threshold: 3 months (90 days) in seconds
const ACTIVE_THRESHOLD_SECONDS = 90 * 24 * 60 * 60
const nowSeconds = Math.floor(Date.now() / 1000)

const members: DaoVoter[] = [
  {
    voter: activeAddress,
    tokens: [1],
    tokenCount: 1,
    timeJoined: 1640995200,
    lastActiveAt: nowSeconds - 60 * 24 * 60 * 60, // Active: 60 days ago
  },
  {
    voter: inactiveAddress,
    tokens: [2],
    tokenCount: 1,
    timeJoined: 1640995200,
    lastActiveAt: nowSeconds - ACTIVE_THRESHOLD_SECONDS - 1000, // Inactive: over 90 days ago
  },
]

const renderList = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MembersList totalSupply={10} />
    </SWRConfig>
  )

describe('MembersList', () => {
  beforeEach(() => {
    vi.mocked(daoActivityRequest).mockReset()
    vi.mocked(daoActivityRequest).mockResolvedValue({
      recentProposalIds: [],
      votes: [],
    })
    vi.mocked(axios.get).mockResolvedValue({ data: { membersList: members } })
  })

  it('renders members and shows the Active badge only on active members', async () => {
    renderList()

    await screen.findByText(activeAddress)

    expect(screen.getByText(activeAddress)).toBeInTheDocument()
    expect(screen.getByText(inactiveAddress)).toBeInTheDocument()
    expect(screen.getAllByText('Active')).toHaveLength(1)
  })

  it('filters to active members when the Active filter is clicked', async () => {
    renderList()

    await screen.findByText(activeAddress)

    fireEvent.click(screen.getByRole('button', { name: 'Active (1)' }))

    await waitFor(() =>
      expect(screen.queryByText(inactiveAddress)).not.toBeInTheDocument()
    )
    expect(screen.getByText(activeAddress)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'All (2)' }))

    await waitFor(() => expect(screen.getByText(inactiveAddress)).toBeInTheDocument())
  })

  it('shows empty state when no listed members are active', async () => {
    const allInactiveMembers: DaoVoter[] = [
      {
        voter: activeAddress,
        tokens: [1],
        tokenCount: 1,
        timeJoined: 1640995200,
        lastActiveAt: nowSeconds - ACTIVE_THRESHOLD_SECONDS - 1000,
      },
      {
        voter: inactiveAddress,
        tokens: [2],
        tokenCount: 1,
        timeJoined: 1640995200,
        lastActiveAt: nowSeconds - ACTIVE_THRESHOLD_SECONDS - 1000,
      },
    ]
    vi.mocked(axios.get).mockResolvedValue({ data: { membersList: allInactiveMembers } })
    renderList()

    await screen.findByText(activeAddress)

    fireEvent.click(screen.getByRole('button', { name: 'Active (0)' }))

    await waitFor(() =>
      expect(screen.getByText('No active members found.')).toBeInTheDocument()
    )
  })

  it('includes old voters on recent completed proposals alongside 90-day activity', async () => {
    vi.mocked(daoActivityRequest).mockResolvedValue({
      recentProposalIds: ['0xp1'],
      votes: [
        {
          voter: inactiveAddress.toUpperCase() as DaoVoter['voter'],
          proposalId: '0xp1',
          timestamp: nowSeconds - 120 * 24 * 60 * 60,
        },
      ],
    })

    renderList()

    fireEvent.click(await screen.findByRole('button', { name: 'Active (2)' }))
    expect(screen.getByText(activeAddress)).toBeInTheDocument()
    expect(screen.getByText(inactiveAddress)).toBeInTheDocument()
    expect(screen.getAllByText('Active')).toHaveLength(2)
    expect(daoActivityRequest).toHaveBeenCalledWith(
      1,
      '0x1000000000000000000000000000000000000001',
      { recentProposalCount: 5 }
    )
  })

  it('waits for voting activity before offering the Active filter or count', async () => {
    vi.mocked(daoActivityRequest).mockReturnValue(new Promise(() => {}))

    renderList()

    await screen.findByText(activeAddress)
    expect(screen.getByRole('button', { name: 'Active' })).toBeDisabled()
  })

  it('reports voting activity errors without displaying an incomplete active count', async () => {
    vi.mocked(daoActivityRequest).mockRejectedValue(new Error('Subgraph unavailable'))

    renderList()

    await screen.findByText('Unable to load voting activity.')
    expect(screen.getByRole('button', { name: 'Active' })).toBeDisabled()
    expect(await screen.findByText(inactiveAddress)).toBeInTheDocument()
  })
})

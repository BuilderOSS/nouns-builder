import { DaoVoter } from '@buildeross/sdk/subgraph'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import React from 'react'
import { SWRConfig } from 'swr'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MembersList } from './MembersList'

const hoisted = vi.hoisted(() => ({
  activeMembers: ['0xaaa0000000000000000000000000000000000001'] as string[] | undefined,
}))

vi.mock('@buildeross/stores', () => ({
  useChainStore: (selector: (s: { chain: { id: number } }) => unknown) =>
    selector({ chain: { id: 1 } }),
  useDaoStore: () => ({
    addresses: { token: '0x1000000000000000000000000000000000000001' },
  }),
}))

vi.mock('axios', () => ({ default: { get: vi.fn() } }))

vi.mock('@buildeross/hooks/useActiveMembers', () => ({
  useActiveMembers: () => ({
    activeMembers: hoisted.activeMembers,
    isActiveMember: (address?: string) =>
      !!address &&
      !!hoisted.activeMembers &&
      hoisted.activeMembers.includes(address.toLowerCase()),
    isLoading: false,
    error: undefined,
  }),
}))

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

const members: DaoVoter[] = [
  { voter: activeAddress, tokens: [1], tokenCount: 1, timeJoined: 1640995200 },
  { voter: inactiveAddress, tokens: [2], tokenCount: 1, timeJoined: 1640995200 },
]

const renderList = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MembersList totalSupply={10} />
    </SWRConfig>
  )

describe('MembersList', () => {
  beforeEach(() => {
    hoisted.activeMembers = [activeAddress]
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
    hoisted.activeMembers = []
    renderList()

    await screen.findByText(activeAddress)

    fireEvent.click(screen.getByRole('button', { name: 'Active (0)' }))

    await waitFor(() =>
      expect(screen.getByText('No active members found.')).toBeInTheDocument()
    )
  })

  it('disables the Active filter while activity data is unavailable', async () => {
    hoisted.activeMembers = undefined
    renderList()

    await screen.findByText(activeAddress)

    expect(screen.getByRole('button', { name: 'Active' })).toBeDisabled()
    // No badges render when activity data is unavailable (StatBadge is a <span>)
    expect(screen.queryAllByText('Active', { selector: 'span' })).toHaveLength(0)
  })
})

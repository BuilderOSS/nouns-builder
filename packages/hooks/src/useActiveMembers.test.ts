import { daoActivityRequest } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useActiveMembers } from './useActiveMembers'

vi.mock('@buildeross/sdk/subgraph', () => ({
  daoActivityRequest: vi.fn(),
}))

const chainId = 1 as CHAIN_ID

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children
  )

describe('useActiveMembers', () => {
  beforeEach(() => {
    vi.mocked(daoActivityRequest).mockReset()
  })

  it('returns active members and a case-insensitive matcher', async () => {
    vi.mocked(daoActivityRequest).mockResolvedValue({
      recentProposalIds: ['0xp1'],
      votes: [
        {
          voter: '0xAbC0000000000000000000000000000000000001' as AddressType,
          proposalId: '0xp1',
          timestamp: 1,
        },
      ],
      bids: [
        {
          bidder: '0xDeF0000000000000000000000000000000000002' as AddressType,
          bidTime: Math.floor(Date.now() / 1000) - 60,
        },
      ],
    })

    const { result } = renderHook(
      () =>
        useActiveMembers({
          chainId,
          collectionAddress: '0x1000000000000000000000000000000000000001' as AddressType,
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.activeMembers).toBeDefined())

    expect(result.current.activeMembers).toEqual([
      '0xabc0000000000000000000000000000000000001',
      '0xdef0000000000000000000000000000000000002',
    ])
    expect(
      result.current.isActiveMember('0XABC0000000000000000000000000000000000001')
    ).toBe(true)
    expect(
      result.current.isActiveMember('0x9990000000000000000000000000000000000009')
    ).toBe(false)
  })

  it('does not fetch without a collection address', () => {
    const { result } = renderHook(() => useActiveMembers({ chainId }), { wrapper })

    expect(daoActivityRequest).not.toHaveBeenCalled()
    expect(result.current.activeMembers).toBeUndefined()
    expect(result.current.isActiveMember('0xabc')).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('does not fetch when disabled', () => {
    renderHook(
      () =>
        useActiveMembers({
          chainId,
          collectionAddress: '0x1000000000000000000000000000000000000002' as AddressType,
          enabled: false,
        }),
      { wrapper }
    )

    expect(daoActivityRequest).not.toHaveBeenCalled()
  })

  it('passes custom thresholds to the request', async () => {
    vi.mocked(daoActivityRequest).mockResolvedValue({
      recentProposalIds: [],
      votes: [],
      bids: [],
    })

    renderHook(
      () =>
        useActiveMembers({
          chainId,
          collectionAddress: '0x1000000000000000000000000000000000000003' as AddressType,
          thresholds: { recentProposalCount: 3, bidWindowSeconds: 86400 },
        }),
      { wrapper }
    )

    await waitFor(() => expect(daoActivityRequest).toHaveBeenCalled())

    expect(daoActivityRequest).toHaveBeenCalledWith(
      chainId,
      '0x1000000000000000000000000000000000000003',
      expect.objectContaining({ recentProposalCount: 3, bidWindowSeconds: 86400 })
    )
  })

  it('surfaces request errors', async () => {
    vi.mocked(daoActivityRequest).mockRejectedValue(new Error('boom'))

    const { result } = renderHook(
      () =>
        useActiveMembers({
          chainId,
          collectionAddress: '0x1000000000000000000000000000000000000004' as AddressType,
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.error).toBeDefined())

    expect(result.current.activeMembers).toBeUndefined()
    expect(result.current.isActiveMember('0xabc')).toBe(false)
  })
})

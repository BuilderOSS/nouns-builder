import type { AuctionStatus } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { SWRConfig } from 'swr'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { diffAuctionStatus, useAuctionEvents } from './useAuctionEvents'

const statusMock = vi.hoisted(() => ({ data: undefined as unknown }))

vi.mock('@buildeross/hooks/useAuctionStatus', () => ({
  useAuctionStatus: () => ({ data: statusMock.data }),
}))

const mutate = vi.fn(() => Promise.resolve())

vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>()
  return { ...actual, useSWRConfig: () => ({ mutate }) }
})

const DAO = '0x00000000000000000000000000000000000000aa'
const AUCTION = '0x00000000000000000000000000000000000000bb'

const status = (overrides: Partial<AuctionStatus> = {}): AuctionStatus => ({
  id: `${DAO}:1`,
  daoId: DAO,
  auctionAddress: AUCTION,
  tokenId: '1',
  startTime: 1000,
  endTime: 2000,
  extended: false,
  settled: false,
  bidCount: 0,
  highestBid: null,
  token: { name: 'Token #1', image: null },
  ...overrides,
})

const response = (s: AuctionStatus | null) => ({
  syncedBlock: 1,
  stale: false,
  auctions: { [DAO]: s },
})

describe('diffAuctionStatus', () => {
  it('reports nothing on the first observation', () => {
    expect(diffAuctionStatus(undefined, status())).toEqual({
      created: false,
      bid: false,
      settled: false,
    })
  })

  it('detects a new auction', () => {
    expect(
      diffAuctionStatus(status(), status({ id: `${DAO}:2`, tokenId: '2' })).created
    ).toBe(true)
    expect(diffAuctionStatus(null, status()).created).toBe(true)
  })

  it('detects a new bid', () => {
    const next = status({ bidCount: 1, highestBid: { amount: '1', bidder: '0x1' } })
    expect(diffAuctionStatus(status(), next)).toEqual({
      created: false,
      bid: true,
      settled: false,
    })
  })

  it('detects settlement', () => {
    expect(diffAuctionStatus(status(), status({ settled: true })).settled).toBe(true)
  })

  it('reports nothing when unchanged', () => {
    expect(diffAuctionStatus(status(), status())).toEqual({
      created: false,
      bid: false,
      settled: false,
    })
  })
})

describe('useAuctionEvents', () => {
  const wrapper = ({ children }: React.PropsWithChildren) =>
    React.createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

  beforeEach(() => {
    vi.clearAllMocks()
    statusMock.data = undefined
  })

  const render = (props: {
    onAuctionCreated?: (id: bigint) => void
    onAuctionBidCreated?: (id: bigint) => void
  }) =>
    renderHook(
      (p) =>
        useAuctionEvents({
          chainId: CHAIN_ID.BASE,
          auctionAddress: AUCTION,
          tokenAddress: DAO,
          ...p,
        }),
      { wrapper, initialProps: props }
    )

  it('does nothing on the first snapshot', () => {
    statusMock.data = response(status())
    render({})
    expect(mutate).not.toHaveBeenCalled()
  })

  it('refreshes the auction and bids on a new bid', async () => {
    const onAuctionBidCreated = vi.fn()
    statusMock.data = response(status())
    const { rerender } = render({ onAuctionBidCreated })

    statusMock.data = response(
      status({ bidCount: 1, highestBid: { amount: '1', bidder: '0x1' } })
    )
    rerender({ onAuctionBidCreated })

    await waitFor(() => expect(onAuctionBidCreated).toHaveBeenCalledWith(1n))
    expect(mutate).toHaveBeenCalledWith(['auction', CHAIN_ID.BASE, AUCTION])
    expect(mutate).toHaveBeenCalledWith(['auction-bids', CHAIN_ID.BASE, DAO, '1'])
  })

  it('calls the onAuctionCreated passed when the change was seen', async () => {
    const onAuctionCreated = vi.fn()
    statusMock.data = response(status())
    const { rerender } = render({ onAuctionCreated })

    // Simulates the caller dropping the callback once the auction refreshes
    mutate.mockImplementationOnce(() =>
      Promise.resolve().then(() => rerender({ onAuctionCreated: undefined }))
    )
    statusMock.data = response(status({ id: `${DAO}:2`, tokenId: '2' }))
    rerender({ onAuctionCreated })

    await waitFor(() => expect(onAuctionCreated).toHaveBeenCalledWith(2n))
  })

  it('refreshes only the auction when it is settled', async () => {
    statusMock.data = response(status())
    const { rerender } = render({})

    statusMock.data = response(status({ settled: true }))
    rerender({})

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1))
    expect(mutate).toHaveBeenCalledWith(['auction', CHAIN_ID.BASE, AUCTION])
  })
})

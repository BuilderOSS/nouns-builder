import { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getSyncStatus } from './sync'

const sdkMock = vi.hoisted(() => ({
  syncStatus: vi.fn(),
}))

vi.mock('../client', () => ({
  SDK: {
    connect: () => sdkMock,
  },
}))

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  flush: vi.fn(() => Promise.resolve(true)),
}))

describe('getSyncStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the synced block number', async () => {
    sdkMock.syncStatus.mockResolvedValueOnce({
      _meta: { block: { number: 42 }, hasIndexingErrors: false },
    })

    await expect(getSyncStatus(CHAIN_ID.BASE)).resolves.toEqual({
      syncedBlockNumber: 42,
      hasIndexingErrors: false,
    })
  })

  it('falls back to block 0 when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementationOnce(() => {})
    sdkMock.syncStatus.mockRejectedValueOnce(new Error('network down'))

    await expect(getSyncStatus(CHAIN_ID.BASE)).resolves.toEqual({
      syncedBlockNumber: 0,
      hasIndexingErrors: false,
    })
  })

  it('shares one in-flight request between concurrent callers', async () => {
    sdkMock.syncStatus.mockResolvedValue({
      _meta: { block: { number: 10 }, hasIndexingErrors: false },
    })

    const [a, b] = await Promise.all([
      getSyncStatus(CHAIN_ID.BASE),
      getSyncStatus(CHAIN_ID.BASE),
    ])

    expect(sdkMock.syncStatus).toHaveBeenCalledTimes(1)
    expect(a).toEqual(b)

    await getSyncStatus(CHAIN_ID.BASE)
    expect(sdkMock.syncStatus).toHaveBeenCalledTimes(2)
  })
})

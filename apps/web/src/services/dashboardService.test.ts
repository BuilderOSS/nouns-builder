import { getProposalState, ProposalState } from '@buildeross/sdk/contract'
import { dashboardRequest } from '@buildeross/sdk/subgraph'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchDashboardDataService } from './dashboardService'
import { getRedisConnection } from './redisConnection'

vi.mock('@buildeross/sdk/contract', () => ({
  getProposalState: vi.fn(),
  ProposalState: {
    Pending: 'PENDING',
    Active: 'ACTIVE',
    Succeeded: 'SUCCEEDED',
    Queued: 'QUEUED',
  },
}))

vi.mock('@buildeross/sdk/subgraph', () => ({ dashboardRequest: vi.fn() }))
vi.mock('./redisConnection', () => ({ getRedisConnection: vi.fn() }))

const address = '0x0000000000000000000000000000000000000001' as const

const makeDao = (tokenAddress: string) =>
  ({
    chainId: 1,
    tokenAddress,
    name: tokenAddress,
    proposals: [
      {
        proposalId: '0x01',
        dao: { governorAddress: '0x0000000000000000000000000000000000000002' },
      },
    ],
  }) as any

describe('fetchDashboardDataService', () => {
  const redis = {
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
  }

  beforeEach(() => {
    vi.resetAllMocks()
    redis.get.mockResolvedValue(null)
    redis.set.mockResolvedValue('OK')
    redis.setex.mockResolvedValue('OK')
    redis.del.mockResolvedValue(1)
    vi.mocked(getRedisConnection).mockReturnValue(redis as any)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retries a failed proposal-state read once and skips caching degraded data', async () => {
    vi.useFakeTimers()
    vi.mocked(dashboardRequest).mockResolvedValue([makeDao('0xdao')])
    vi.mocked(getProposalState).mockRejectedValue(new Error('RPC unavailable'))

    const resultPromise = fetchDashboardDataService(address)
    await vi.runAllTimersAsync()
    const result = await resultPromise

    expect(getProposalState).toHaveBeenCalledTimes(2)
    expect(result[0].proposals).toEqual([])
    expect(redis.setex).not.toHaveBeenCalled()
    expect(redis.del).toHaveBeenCalled()
  })

  it('times out enrichment per DAO without discarding successful DAO results', async () => {
    vi.useFakeTimers()
    let slowRequestAborted = false
    vi.mocked(dashboardRequest).mockResolvedValue([
      makeDao('0xslow'),
      makeDao('0xhealthy'),
    ])
    vi.mocked(getProposalState)
      .mockImplementationOnce(
        (_chainId, _governorAddress, _proposalId, signal) =>
          new Promise((_, reject) => {
            signal?.addEventListener(
              'abort',
              () => {
                slowRequestAborted = true
                reject(signal.reason)
              },
              { once: true }
            )
          })
      )
      .mockImplementationOnce(async () => {
        expect(slowRequestAborted).toBe(true)
        return ProposalState.Active
      })

    const resultPromise = fetchDashboardDataService(address)
    await vi.advanceTimersByTimeAsync(8_000)
    const result = await resultPromise

    expect(result).toHaveLength(2)
    expect(result[0].proposals).toEqual([])
    expect(result[1].proposals).toHaveLength(1)
    expect(slowRequestAborted).toBe(true)
    expect(redis.setex).not.toHaveBeenCalled()
  })
})

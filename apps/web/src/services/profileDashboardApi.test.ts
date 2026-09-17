import type { NextApiRequest, NextApiResponse } from 'next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import defaultHandler, {
  getProfileDashboardCacheKey,
  profileDashboardHandler,
} from '../pages/api/profile-dashboard'

const { profileDashboardQueryMock, redisMock } = vi.hoisted(() => ({
  profileDashboardQueryMock: vi.fn(),
  redisMock: {
    expire: vi.fn(),
    get: vi.fn(),
    incr: vi.fn(),
    setex: vi.fn(),
  },
}))

vi.mock('@buildeross/constants/chains', () => ({
  PUBLIC_DEFAULT_CHAINS: [{ id: 8453, name: 'Base', slug: 'base' }],
}))

vi.mock('@buildeross/sdk/subgraph', () => ({
  profileDashboardQuery: profileDashboardQueryMock,
}))

vi.mock('src/services/redisConnection', () => ({
  getRedisConnection: () => redisMock,
}))

type ApiResponse = NextApiResponse & {
  body?: unknown
  statusCode?: number
}

const createRequest = (
  query: Record<string, string> = {
    address: '0x00000000000000000000000000000000000000AA',
    mode: 'summary',
  }
) =>
  ({
    headers: { 'x-forwarded-for': '203.0.113.10' },
    method: 'GET',
    query,
    socket: { remoteAddress: '203.0.113.10' },
    url: `/api/profile-dashboard?${new URLSearchParams(query).toString()}`,
  }) as unknown as NextApiRequest

const createResponse = () => {
  const response = {
    setHeader: vi.fn(),
    status(code: number) {
      response.statusCode = code
      return response
    },
    json(body: unknown) {
      response.body = body
      return response
    },
  } as unknown as ApiResponse
  return response
}

const chainResult = {
  tokens: [],
  auctionWins: [],
  counts: { tokenHoldings: 4, proposalVotes: 1, proposalsSubmitted: 2, bidsPlaced: 3 },
  isComplete: true,
}

describe('profile-dashboard API', () => {
  beforeEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    redisMock.get.mockResolvedValue(null)
    redisMock.incr.mockResolvedValue(1)
    redisMock.expire.mockResolvedValue(1)
    redisMock.setex.mockResolvedValue('OK')
    profileDashboardQueryMock.mockResolvedValue(chainResult)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('normalizes the public address and scopes cache entries by mode', () => {
    expect(
      getProfileDashboardCacheKey('0x00000000000000000000000000000000000000AA', 'summary')
    ).toMatch(/^profile-dashboard:v4:summary:0x[0-9a-f]{16}$/)
    expect(
      getProfileDashboardCacheKey('0x00000000000000000000000000000000000000aa', 'tokens')
    ).not.toBe(
      getProfileDashboardCacheKey('0x00000000000000000000000000000000000000aa', 'summary')
    )
  })

  it('serves a valid Redis cache hit without querying subgraphs', async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify({
        mode: 'summary',
        chains: [
          { chainId: 8453, chainName: 'Base', chainSlug: 'base', result: chainResult },
        ],
      })
    )
    const response = createResponse()

    await profileDashboardHandler(createRequest(), response)

    expect(response.statusCode).toBe(200)
    expect(profileDashboardQueryMock).not.toHaveBeenCalled()
    expect(redisMock.setex).not.toHaveBeenCalled()
  })

  it('caches successful misses and passes the requested query mode', async () => {
    const response = createResponse()

    await profileDashboardHandler(createRequest(), response)

    expect(profileDashboardQueryMock).toHaveBeenCalledWith(
      8453,
      '0x00000000000000000000000000000000000000aa',
      expect.objectContaining({ mode: 'summary', signal: expect.any(AbortSignal) })
    )
    expect(redisMock.setex).toHaveBeenCalledWith(
      expect.stringContaining('profile-dashboard:v4:summary:'),
      60,
      expect.any(String)
    )
    expect(response.statusCode).toBe(200)
  })

  it('aborts timed-out subgraph requests', async () => {
    vi.useFakeTimers()
    profileDashboardQueryMock.mockReturnValue(new Promise(() => undefined))
    const response = createResponse()

    const request = profileDashboardHandler(createRequest(), response)
    await vi.advanceTimersByTimeAsync(12_000)
    await request

    const queryOptions = profileDashboardQueryMock.mock.calls[0]?.[2] as
      | { signal?: AbortSignal }
      | undefined
    expect(queryOptions?.signal?.aborted).toBe(true)
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        chains: [
          expect.objectContaining({
            chainId: 8453,
            error: 'Profile data unavailable for this chain.',
          }),
        ],
      })
    )
    vi.useRealTimers()
  })

  it('rejects unsupported modes before doing work', async () => {
    const response = createResponse()

    await profileDashboardHandler(
      createRequest({
        address: '0x00000000000000000000000000000000000000aa',
        mode: 'everything',
      }),
      response
    )

    expect(response.statusCode).toBe(400)
    expect(profileDashboardQueryMock).not.toHaveBeenCalled()
  })

  it('rate limits repeated calls through the exported API handler', async () => {
    redisMock.incr.mockResolvedValue(21)
    const response = createResponse()

    await defaultHandler(createRequest(), response)

    expect(response.statusCode).toBe(429)
    expect(response.body).toEqual(expect.objectContaining({ retryAfter: 60 }))
    expect(profileDashboardQueryMock).not.toHaveBeenCalled()
  })
})

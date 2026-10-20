import { daosAuctionStatusRequest, liveAuctionsRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __resetAuctionStatusCache,
  getAuctionStatuses,
  getLiveAuctionSnapshot,
} from './auctionStatusService'
import { getRedisConnection } from './redisConnection'

vi.mock('@buildeross/sdk/subgraph', () => ({
  liveAuctionsRequest: vi.fn(),
  daosAuctionStatusRequest: vi.fn(),
}))
vi.mock('./redisConnection', () => ({ getRedisConnection: vi.fn() }))

const status = (daoId: string, overrides = {}) => ({
  id: `${daoId}:1`,
  daoId,
  auctionAddress: '0xauction',
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

/** Minimal in-memory Redis covering the commands the service uses */
const createFakeRedis = () => {
  const store = new Map<string, string>()
  const set = vi.fn(async (key: string, value: string, ...args: unknown[]) => {
    if (args.includes('NX') && store.has(key)) return null
    store.set(key, value)
    return 'OK'
  })
  const chain = () => {
    const ops: Array<() => Promise<unknown>> = []
    const api = {
      set: (key: string, value: string, ...args: unknown[]) => {
        ops.push(() => set(key, value, ...args))
        return api
      },
      exec: async () => Promise.all(ops.map((op) => op())),
    }
    return api
  }
  return {
    store,
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    mget: vi.fn(async (keys: string[]) => keys.map((key) => store.get(key) ?? null)),
    set,
    del: vi.fn(async (key: string) => (store.delete(key) ? 1 : 0)),
    multi: vi.fn(chain),
    pipeline: vi.fn(chain),
  }
}

describe('auctionStatusService', () => {
  let redis: ReturnType<typeof createFakeRedis>

  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    __resetAuctionStatusCache()
    redis = createFakeRedis()
    vi.mocked(getRedisConnection).mockReturnValue(redis as any)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('serves the snapshot from the in-process cache within the TTL', async () => {
    vi.mocked(liveAuctionsRequest).mockResolvedValue({
      syncedBlock: 10,
      auctions: { '0xdao': status('0xdao') },
    })

    await getLiveAuctionSnapshot(CHAIN_ID.BASE)
    await getLiveAuctionSnapshot(CHAIN_ID.BASE)

    expect(liveAuctionsRequest).toHaveBeenCalledTimes(1)
  })

  it('shares one subgraph request between concurrent callers', async () => {
    vi.mocked(liveAuctionsRequest).mockResolvedValue({ syncedBlock: 10, auctions: {} })

    await Promise.all([
      getLiveAuctionSnapshot(CHAIN_ID.BASE),
      getLiveAuctionSnapshot(CHAIN_ID.BASE),
      getLiveAuctionSnapshot(CHAIN_ID.BASE),
    ])

    expect(liveAuctionsRequest).toHaveBeenCalledTimes(1)
  })

  it('reads a snapshot another instance wrote to Redis', async () => {
    redis.store.set(
      'auction-status:8453:snapshot',
      JSON.stringify({
        syncedBlock: 99,
        auctions: { '0xdao': status('0xdao') },
        fetchedAt: Date.now(),
      })
    )

    const result = await getLiveAuctionSnapshot(CHAIN_ID.BASE)

    expect(liveAuctionsRequest).not.toHaveBeenCalled()
    expect(result.syncedBlock).toBe(99)
    expect(result.stale).toBe(false)
  })

  it('writes fresh and stale copies to Redis and releases the lock', async () => {
    vi.mocked(liveAuctionsRequest).mockResolvedValue({ syncedBlock: 10, auctions: {} })

    await getLiveAuctionSnapshot(CHAIN_ID.BASE)

    expect(redis.store.has('auction-status:8453:snapshot')).toBe(true)
    expect(redis.store.has('auction-status:8453:snapshot:stale')).toBe(true)
    expect(redis.store.has('auction-status:8453:snapshot:lock')).toBe(false)
  })

  it('serves the stale snapshot instead of fetching while another instance holds the lock', async () => {
    vi.useFakeTimers()
    redis.store.set('auction-status:8453:snapshot:lock', '1')
    redis.store.set(
      'auction-status:8453:snapshot:stale',
      JSON.stringify({ syncedBlock: 5, auctions: {}, fetchedAt: Date.now() })
    )

    const promise = getLiveAuctionSnapshot(CHAIN_ID.BASE)
    await vi.advanceTimersByTimeAsync(300)
    const result = await promise

    expect(liveAuctionsRequest).not.toHaveBeenCalled()
    expect(result).toMatchObject({ syncedBlock: 5, stale: true })
  })

  it('falls back to the stale snapshot when the subgraph fails', async () => {
    redis.store.set(
      'auction-status:8453:snapshot:stale',
      JSON.stringify({ syncedBlock: 5, auctions: {}, fetchedAt: Date.now() })
    )
    vi.mocked(liveAuctionsRequest).mockRejectedValue(new Error('429'))

    const result = await getLiveAuctionSnapshot(CHAIN_ID.BASE)

    expect(result).toMatchObject({ syncedBlock: 5, stale: true })
  })

  it('throws when the subgraph fails and there is no stale snapshot', async () => {
    vi.mocked(liveAuctionsRequest).mockRejectedValue(new Error('429'))

    await expect(getLiveAuctionSnapshot(CHAIN_ID.BASE)).rejects.toThrow('429')
  })

  it('looks up DAOs missing from the snapshot in one batched request and caches them', async () => {
    vi.mocked(liveAuctionsRequest).mockResolvedValue({
      syncedBlock: 10,
      auctions: { '0xlive': status('0xlive') },
    })
    vi.mocked(daosAuctionStatusRequest).mockResolvedValue({
      syncedBlock: 10,
      auctions: { '0xsettled': status('0xsettled', { settled: true }), '0xnone': null },
    })

    const result = await getAuctionStatuses(CHAIN_ID.BASE, [
      '0xlive',
      '0xsettled',
      '0xnone',
    ])

    expect(daosAuctionStatusRequest).toHaveBeenCalledTimes(1)
    expect(daosAuctionStatusRequest).toHaveBeenCalledWith(CHAIN_ID.BASE, [
      '0xsettled',
      '0xnone',
    ])
    expect(result.auctions['0xlive']?.settled).toBe(false)
    expect(result.auctions['0xsettled']?.settled).toBe(true)
    expect(result.auctions['0xnone']).toBeNull()
    expect(result.stale).toBe(false)

    await getAuctionStatuses(CHAIN_ID.BASE, ['0xsettled', '0xnone'])
    expect(daosAuctionStatusRequest).toHaveBeenCalledTimes(1)
  })

  it('omits fallback DAOs and flags stale when the batched lookup fails', async () => {
    vi.mocked(liveAuctionsRequest).mockResolvedValue({
      syncedBlock: 10,
      auctions: { '0xlive': status('0xlive') },
    })
    vi.mocked(daosAuctionStatusRequest).mockRejectedValue(new Error('429'))

    const result = await getAuctionStatuses(CHAIN_ID.BASE, ['0xlive', '0xsettled'])

    expect(result.stale).toBe(true)
    expect(result.auctions['0xlive']).toBeDefined()
    expect('0xsettled' in result.auctions).toBe(false)
  })

  it('works without Redis', async () => {
    vi.mocked(getRedisConnection).mockReturnValue(undefined)
    vi.mocked(liveAuctionsRequest).mockResolvedValue({ syncedBlock: 10, auctions: {} })
    vi.mocked(daosAuctionStatusRequest).mockResolvedValue({
      syncedBlock: 10,
      auctions: { '0xdao': null },
    })

    const result = await getAuctionStatuses(CHAIN_ID.BASE, ['0xdao'])

    expect(result.auctions['0xdao']).toBeNull()
  })
})

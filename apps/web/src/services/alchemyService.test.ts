import { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AlchemyRequestError } from './alchemyApi'
import { getCachedTokenMetadatas } from './alchemyService'
import { BackendFailedError } from './errors'
import { getRedisConnection } from './redisConnection'

const getTokenMetadata = vi.hoisted(() => vi.fn())

vi.mock('./alchemyApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./alchemyApi')>()),
  getAlchemyClient: () => ({ getTokenMetadata }),
}))
vi.mock('./redisConnection', () => ({ getRedisConnection: vi.fn() }))

const USDC = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
const PERMIT2 = '0x000000000022d473030f116ddee9f6b43ac78ba3'

/** What Alchemy returns for contracts that aren't ERC-20 tokens */
const invalidTokenError = () =>
  new AlchemyRequestError(
    'Alchemy request to /v2 failed with 400: {"error":{"code":-32602}}',
    400,
    -32602
  )

const usdcMetadata = { name: 'USD Coin', symbol: 'USDC', decimals: 6, logo: 'usdc.png' }

const createFakeRedis = () => {
  const store = new Map<string, string>()
  return {
    store,
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    setex: vi.fn(async (key: string, _ttl: number, value: string) => {
      store.set(key, value)
      return 'OK'
    }),
  }
}

describe('getCachedTokenMetadatas', () => {
  let redis: ReturnType<typeof createFakeRedis>

  beforeEach(() => {
    vi.clearAllMocks()
    redis = createFakeRedis()
    vi.mocked(getRedisConnection).mockReturnValue(redis as any)
  })

  it('omits non-token contracts instead of failing the whole batch', async () => {
    getTokenMetadata.mockImplementation(async (address: string) => {
      if (address === PERMIT2) throw invalidTokenError()
      return usdcMetadata
    })

    const result = await getCachedTokenMetadatas(CHAIN_ID.BASE, [USDC, PERMIT2])

    expect(result?.data).toEqual([
      { address: USDC, name: 'USD Coin', symbol: 'USDC', decimals: 6, logo: 'usdc.png' },
    ])
  })

  it('remembers non-token contracts so Alchemy is not asked again', async () => {
    getTokenMetadata.mockRejectedValue(invalidTokenError())

    await getCachedTokenMetadatas(CHAIN_ID.BASE, [PERMIT2])
    const second = await getCachedTokenMetadatas(CHAIN_ID.BASE, [PERMIT2])

    expect(getTokenMetadata).toHaveBeenCalledTimes(1)
    expect(second).toEqual({ data: [], source: 'cache' })
  })

  it('still fails on transient errors, after caching the lookups that succeeded', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getTokenMetadata.mockImplementation(async (address: string) => {
      if (address === PERMIT2) {
        throw new AlchemyRequestError('Alchemy request to /v2 failed with 503', 503)
      }
      return usdcMetadata
    })

    await expect(getCachedTokenMetadatas(CHAIN_ID.BASE, [USDC, PERMIT2])).rejects.toThrow(
      BackendFailedError
    )
    expect(redis.store.size).toBe(1)
  })
})

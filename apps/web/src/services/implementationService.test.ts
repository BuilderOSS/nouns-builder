import { CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import { Address, Hex } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getImplementationAddress } from './implementationService'
import { getRedisConnection } from './redisConnection'

vi.mock('ioredis', () => {
  const Redis = vi.fn()
  Redis.prototype.get = vi.fn()
  Redis.prototype.setex = vi.fn()
  return { default: Redis }
})

vi.mock('@buildeross/utils/provider', () => ({
  getProvider: vi.fn(),
}))

vi.mock('./redisConnection', () => ({
  getRedisConnection: vi.fn(),
}))

describe('implementationService', () => {
  const testAddress = '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D' as Address
  const testImplementation = '0x1234567890123456789012345678901234567890' as Address
  const testChainId = CHAIN_ID.ETHEREUM

  let mockProvider: any
  let mockRedis: any

  beforeEach(() => {
    vi.resetAllMocks()

    // Mock provider
    mockProvider = {
      getStorageAt: vi
        .fn()
        .mockResolvedValue(
          '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
        ),
      getCode: vi.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50' as Hex),
      call: vi.fn().mockResolvedValue({ data: '0x' as Hex }),
    }
    vi.mocked(getProvider).mockReturnValue(mockProvider)

    // Mock Redis
    mockRedis = {
      get: vi.fn().mockResolvedValue(null),
      setex: vi.fn().mockResolvedValue(null),
    }
    vi.mocked(getRedisConnection).mockReturnValue(mockRedis)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getImplementationAddress', () => {
    it('returns cached implementation if available', async () => {
      mockRedis.get.mockResolvedValue(testImplementation)

      const result = await getImplementationAddress(testChainId, testAddress)

      expect(result).toEqual({
        implementation: testImplementation,
        source: 'cache',
      })
      expect(mockRedis.get).toHaveBeenCalledWith(
        `proxy:impl:${testChainId}:${testAddress}`
      )
    })

    it('detects implementation via storage slots', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockProvider.getStorageAt.mockResolvedValueOnce(
        `0x000000000000000000000000${testImplementation.slice(2)}` as Hex
      )

      const result = await getImplementationAddress(testChainId, testAddress)

      expect(result).toEqual({
        implementation: testImplementation,
        source: 'implementation',
      })
      expect(mockProvider.getStorageAt).toHaveBeenCalledWith({
        address: testAddress,
        slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
      })
    })

    it('detects implementation via beacon proxy', async () => {
      mockRedis.get.mockResolvedValue(null)

      // First storage slot call returns empty
      mockProvider.getStorageAt.mockResolvedValueOnce(
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
      )
      mockProvider.getStorageAt.mockResolvedValueOnce(
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
      )

      // Beacon slot returns beacon address
      const beaconAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address
      mockProvider.getStorageAt.mockResolvedValueOnce(
        `0x000000000000000000000000${beaconAddress.slice(2)}` as Hex
      )

      // Beacon call returns implementation
      mockProvider.call.mockResolvedValueOnce({
        data: `0x000000000000000000000000${testImplementation.slice(2)}` as Hex,
      })

      const result = await getImplementationAddress(testChainId, testAddress)

      expect(result).toEqual({
        implementation: testImplementation,
        source: 'beacon',
      })
    })

    it('detects implementation via direct calls', async () => {
      mockRedis.get.mockResolvedValue(null)

      // Storage slots return empty
      mockProvider.getStorageAt.mockResolvedValue(
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
      )

      // Direct call returns implementation
      mockProvider.call.mockResolvedValueOnce({
        data: `0x000000000000000000000000${testImplementation.slice(2)}` as Hex,
      })

      const result = await getImplementationAddress(testChainId, testAddress)

      expect(result).toEqual({
        implementation: testImplementation,
        source: 'direct',
      })
    })

    it('detects EIP-1167 minimal proxy via bytecode', async () => {
      mockRedis.get.mockResolvedValue(null)

      // Storage slots and direct calls return empty
      mockProvider.getStorageAt.mockResolvedValue(
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
      )
      mockProvider.call.mockResolvedValue({ data: '0x' as Hex })

      // Bytecode contains EIP-1167 pattern
      const minimalProxyCode =
        `0x363d3d373d3d3d363d73${testImplementation.slice(2)}5af43d82803e903d91602b57fd5bf3` as Hex
      mockProvider.getCode.mockResolvedValue(minimalProxyCode)

      const result = await getImplementationAddress(testChainId, testAddress)

      expect(result).toEqual({
        implementation: testImplementation,
        source: 'code',
      })
    })

    it('returns original address when no proxy detected', async () => {
      mockRedis.get.mockResolvedValue(null)

      // All detection methods return empty
      mockProvider.getStorageAt.mockResolvedValue(
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
      )
      mockProvider.call.mockResolvedValue({ data: '0x' as Hex })
      mockProvider.getCode.mockResolvedValue(
        '0x608060405234801561001057600080fd5b50' as Hex
      ) // Regular contract code

      const result = await getImplementationAddress(testChainId, testAddress)

      expect(result).toEqual({
        implementation: testAddress,
        source: 'none',
      })
    })

    it('caches the result after detection', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockProvider.getStorageAt.mockResolvedValueOnce(
        `0x000000000000000000000000${testImplementation.slice(2)}` as Hex
      )

      await getImplementationAddress(testChainId, testAddress)

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `proxy:impl:${testChainId}:${testAddress}`,
        60 * 60 * 24, // 24 hours
        testImplementation
      )
    })

    it('caches negative results with shorter TTL', async () => {
      mockRedis.get.mockResolvedValue(null)

      // All detection methods return empty
      mockProvider.getStorageAt.mockResolvedValue(
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
      )
      mockProvider.call.mockResolvedValue({ data: '0x' as Hex })
      mockProvider.getCode.mockResolvedValue(
        '0x608060405234801561001057600080fd5b50' as Hex
      )

      await getImplementationAddress(testChainId, testAddress)

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `proxy:impl:${testChainId}:${testAddress}`,
        60 * 60, // 1 hour
        testAddress
      )
    })

    it('handles errors gracefully and continues to next detection method', async () => {
      mockRedis.get.mockResolvedValue(null)

      // First storage slot throws error
      mockProvider.getStorageAt.mockRejectedValueOnce(new Error('Network error'))
      // Second storage slot returns implementation
      mockProvider.getStorageAt.mockResolvedValueOnce(
        `0x000000000000000000000000${testImplementation.slice(2)}` as Hex
      )

      const result = await getImplementationAddress(testChainId, testAddress)

      expect(result).toEqual({
        implementation: testImplementation,
        source: 'implementation',
      })
    })

    it('validates address format correctly', async () => {
      const invalidAddress = 'invalid-address'

      await expect(() =>
        getImplementationAddress(testChainId, invalidAddress as Address)
      ).rejects.toThrow()
    })
  })
})

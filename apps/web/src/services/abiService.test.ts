import { CHAIN_ID } from '@buildeross/types'
import axios from 'axios'
import Redis from 'ioredis'
import { describe, expect, it, vi } from 'vitest'

import { getContractABIByAddress } from './abiService'
import { BackendFailedError, InvalidRequestError, NotFoundError } from './errors'
import * as implementationService from './implementationService'

vi.mock('ioredis', () => {
  const Redis = vi.fn()

  Redis.prototype.get = vi.fn()
  Redis.prototype.set = vi.fn()

  return { default: Redis }
})

vi.mock('axios', () => {
  return { default: { get: vi.fn() } }
})

describe('abiService', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...OLD_ENV } // Make a copy
    // Mock getImplementationAddress to return the same address by default
    vi.spyOn(implementationService, 'getImplementationAddress').mockResolvedValue({
      implementation: '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D',
      source: 'none',
    })
  })

  afterEach(() => {
    process.env = OLD_ENV
    vi.restoreAllMocks()
  })

  describe('runs fetch', () => {
    it('fails with invalid address', async () => {
      await expect(() =>
        getContractABIByAddress(CHAIN_ID.ETHEREUM, 'asdf')
      ).rejects.toThrow(InvalidRequestError)
    })

    it('fails with an undefined address', async () => {
      await expect(() =>
        getContractABIByAddress(CHAIN_ID.ETHEREUM, undefined)
      ).rejects.toThrow(InvalidRequestError)
    })

    it('calls getImplementationAddress to resolve proxy', async () => {
      const implementationSpy = vi.spyOn(
        implementationService,
        'getImplementationAddress'
      )

      vi.mocked(axios.get).mockResolvedValueOnce({
        status: 200,
        data: { status: '1', result: '[]' },
      })

      await getContractABIByAddress(
        CHAIN_ID.ETHEREUM,
        '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D'
      )

      expect(implementationSpy).toHaveBeenCalledWith(
        CHAIN_ID.ETHEREUM,
        '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D'
      )
    })

    it('skips redis check and checks original contract with etherscan', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        status: 200,
        data: { status: '1', result: '[]' },
      })

      const response = await getContractABIByAddress(
        CHAIN_ID.ETHEREUM,
        '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D'
      )

      expect(response).toEqual({
        abi: '[]',
        address: '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D',
        fetchedAddress: '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D',
        source: 'fetched',
      })
    })

    it('fails given an non 200 response status from etherscan', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        status: 500,
      })

      await expect(() =>
        getContractABIByAddress(
          CHAIN_ID.ETHEREUM,
          '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D'
        )
      ).rejects.toThrow(BackendFailedError)
    })

    it('fails given a non-verified abi', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        status: 200,
        data: { status: '2', result: '[]' },
      })

      await expect(() =>
        getContractABIByAddress(
          CHAIN_ID.ETHEREUM,
          '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D'
        )
      ).rejects.toThrow(NotFoundError)
    })

    it('checks redis for existing key in a proxy case', async () => {
      process.env.REDIS_URL = 'something'

      const connection = new Redis(process.env.REDIS_URL)

      // Mock the Redis cache to return an ABI cache entry
      vi.mocked(connection.get).mockResolvedValue(JSON.stringify({ result: '[]' }))

      // Mock getImplementationAddress to return a different address (simulating proxy resolution)
      vi.spyOn(implementationService, 'getImplementationAddress').mockResolvedValue({
        implementation: '0x0000000000000000000000000000000000000123',
        source: 'cache',
      })

      const response = await getContractABIByAddress(
        CHAIN_ID.ETHEREUM,
        '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D'
      )

      expect(response).toEqual({
        abi: '[]',
        address: '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D',
        fetchedAddress: '0x0000000000000000000000000000000000000123',
        source: 'cache',
      })
    })
  })
})

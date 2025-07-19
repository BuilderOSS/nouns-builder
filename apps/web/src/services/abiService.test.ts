import { CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import axios from 'axios'
import Redis from 'ioredis'
import { Hex } from 'viem'
import { describe, expect, it, vi } from 'vitest'

import { getContractABIByAddress } from './abiService'
import { BackendFailedError, InvalidRequestError, NotFoundError } from './errors'

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
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  describe('runs fetch', () => {
    it('fails with invalid address', async () => {
      expect(() => getContractABIByAddress(CHAIN_ID.ETHEREUM, 'asdf')).rejects.toThrow(
        InvalidRequestError
      )
    })

    it('fails with an undefined address', async () => {
      expect(() => getContractABIByAddress(CHAIN_ID.ETHEREUM, undefined)).rejects.toThrow(
        InvalidRequestError
      )
    })

    it('attempts to fetch the slot from the provider', async () => {
      const spy = vi.spyOn(getProvider(CHAIN_ID.ETHEREUM), 'getStorageAt')

      spy.mockImplementationOnce(
        async () =>
          '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
      )

      // We know the contract call will fail but we want to validate the slot call
      try {
        await getContractABIByAddress(
          CHAIN_ID.ETHEREUM,
          '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D'
        )
      } catch (err) {}

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith({
        address: '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D',
        slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
      })
    })

    it('skips redis check and checks original contract with etherscan', async () => {
      const spy = vi.spyOn(getProvider(CHAIN_ID.ETHEREUM), 'getStorageAt')

      spy.mockImplementationOnce(
        async () =>
          '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
      )

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
      const spy = vi.spyOn(getProvider(CHAIN_ID.ETHEREUM), 'getStorageAt')

      spy.mockImplementationOnce(
        async () =>
          '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
      )

      vi.mocked(axios.get).mockResolvedValueOnce({
        status: 500,
      })

      expect(() =>
        getContractABIByAddress(
          CHAIN_ID.ETHEREUM,
          '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D'
        )
      ).rejects.toThrow(BackendFailedError)
    })

    it('fails given a non-verified abi', async () => {
      const spy = vi.spyOn(getProvider(CHAIN_ID.ETHEREUM), 'getStorageAt')

      spy.mockImplementationOnce(
        async () =>
          '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex
      )

      vi.mocked(axios.get).mockResolvedValueOnce({
        status: 200,
        data: { status: '2', result: '[]' },
      })

      expect(() =>
        getContractABIByAddress(
          CHAIN_ID.ETHEREUM,
          '0x9444390c01Dd5b7249E53FAc31290F7dFF53450D'
        )
      ).rejects.toThrow(NotFoundError)
    })

    it('checks redis for existing key in a proxy case', async () => {
      process.env.REDIS_URL = 'something'

      const connection = new Redis(process.env.REDIS_URL)

      vi.mocked(connection.get).mockResolvedValue(JSON.stringify({ result: '[]' }))

      const spy = vi.spyOn(getProvider(CHAIN_ID.ETHEREUM), 'getStorageAt')

      spy.mockImplementationOnce(
        async () =>
          '0x0000000000000000000000000000000000000000000000000000000000000123' as Hex
      )

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

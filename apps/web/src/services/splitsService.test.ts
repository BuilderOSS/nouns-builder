import { SplitsClient } from '@0xsplits/splits-sdk'
import { CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import axios from 'axios'
import { encodeFunctionData, parseAbiItem, zeroAddress } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getRedisConnection } from './redisConnection'
import { getSplitInfo } from './splitsService'

vi.mock('@buildeross/utils/provider', () => ({ getProvider: vi.fn() }))
vi.mock('./redisConnection', () => ({ getRedisConnection: vi.fn() }))
vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }))
vi.mock('@0xsplits/splits-sdk', () => ({ SplitsClient: vi.fn() }))

const address = '0x1111111111111111111111111111111111111111'
const creationTxHash = `0x${'ab'.repeat(32)}`
const terms = { accounts: [address], percentAllocations: [1_000_000], distributorFee: 0 }
const redis = { get: vi.fn(), setex: vi.fn() }
const provider = {
  readContract: vi.fn(),
  getTransactionReceipt: vi.fn(),
  getTransaction: vi.fn(),
  getBlock: vi.fn(),
  getLogs: vi.fn(),
}
const getSplitMetadata = vi.fn()

describe('split creation transaction metadata', () => {
  afterEach(() => vi.unstubAllEnvs())
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('SPLITS_API_KEY', 'test-key')
    vi.mocked(SplitsClient).mockImplementation(function () {
      return { dataClient: { getSplitMetadata } } as any
    })
    getSplitMetadata.mockResolvedValue({
      recipients: [{ recipient: { address }, percentAllocation: 100 }],
      distributorFeePercent: 0,
      createdBlock: 123,
    })
    provider.getBlock.mockResolvedValue({ timestamp: 1000n })
    provider.getLogs.mockResolvedValue([])
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        data: {
          split: {
            accountEvents: [
              {
                __typename: 'SetSplitEvent',
                type: 'update',
                transaction: { id: `0x${'ef'.repeat(32)}` },
              },
              {
                __typename: 'SetSplitEvent',
                type: 'create',
                transaction: { id: creationTxHash },
              },
            ],
          },
        },
      },
    })
    vi.mocked(getProvider).mockReturnValue(provider as any)
    vi.mocked(getRedisConnection).mockReturnValue(redis as any)
    provider.readContract.mockResolvedValue(`0x${'cd'.repeat(32)}`)
    provider.getTransactionReceipt.mockResolvedValue({ logs: [] })
    vi.mocked(axios.get).mockResolvedValue({
      data: { result: [{ txHash: creationTxHash }] },
    })
    provider.getTransaction.mockResolvedValue({
      input: encodeFunctionData({
        abi: [
          parseAbiItem(
            'function createSplit(address[] accounts, uint32[] percentAllocations, uint32 distributorFee, address controller) returns (address)'
          ),
        ],
        functionName: 'createSplit',
        args: [[address], [1_000_000], 0, zeroAddress],
      }),
    })
  })

  it('returns and caches the creation hash alongside terms', async () => {
    const result = await getSplitInfo(CHAIN_ID.BASE, address)
    expect(result).toEqual({ isSplit: true, terms, creationTxHash, source: 'fetched' })
    expect(redis.setex).toHaveBeenCalledWith(
      expect.stringContaining('splits:info:v2:'),
      3600,
      JSON.stringify({ terms, creationTxHash })
    )
  })

  it('preserves the creation hash on cache hits', async () => {
    redis.get.mockResolvedValue(JSON.stringify({ terms, creationTxHash }))
    expect(await getSplitInfo(CHAIN_ID.BASE, address)).toEqual({
      isSplit: true,
      terms,
      creationTxHash,
      source: 'cache',
    })
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('returns the creation hash even when terms cannot be decoded', async () => {
    getSplitMetadata.mockRejectedValue(new Error('Unavailable'))
    provider.getTransaction.mockResolvedValue({ input: '0x' })
    expect(await getSplitInfo(CHAIN_ID.BASE, address)).toMatchObject({
      isSplit: true,
      terms: null,
      creationTxHash,
      reason: 'undecodable',
    })
  })

  it('gets the original creation hash from GraphQL when Etherscan fails', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Etherscan unavailable'))
    expect(await getSplitInfo(CHAIN_ID.BASE, address)).toMatchObject({
      terms,
      creationTxHash,
    })
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.splits.org/graphql',
      expect.objectContaining({
        variables: { address, chainId: String(CHAIN_ID.BASE), timestamp: 1000 },
      }),
      expect.any(Object)
    )
  })

  it('backfills cached terms that have no creation hash', async () => {
    redis.get.mockResolvedValue(JSON.stringify({ terms }))
    vi.mocked(axios.get).mockRejectedValue(new Error('Etherscan unavailable'))
    expect(await getSplitInfo(CHAIN_ID.BASE, address)).toMatchObject({
      terms,
      creationTxHash,
    })
    expect(redis.setex).toHaveBeenCalled()
  })

  it('uses creation-block logs when GraphQL events fail', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Etherscan unavailable'))
    vi.mocked(axios.post).mockRejectedValue(new Error('GraphQL events unavailable'))
    provider.getLogs.mockResolvedValue([
      { args: { split: zeroAddress }, transactionHash: `0x${'ef'.repeat(32)}` },
      { args: { split: address }, transactionHash: creationTxHash },
    ])
    expect(await getSplitInfo(CHAIN_ID.BASE, address)).toMatchObject({
      terms,
      creationTxHash,
    })
    expect(provider.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        fromBlock: 123n,
        toBlock: 123n,
      })
    )
  })

  it('serializes an explicit null and keeps terms when no source has the hash', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { result: 'rate limited' } })
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        data: {
          split: {
            accountEvents: [
              {
                __typename: 'SetSplitEvent',
                type: 'update',
                transaction: { id: creationTxHash },
              },
            ],
          },
        },
      },
    })
    const result = await getSplitInfo(CHAIN_ID.BASE, address)
    expect(JSON.parse(JSON.stringify(result))).toMatchObject({
      terms,
      creationTxHash: null,
    })
  })

  it('includes the field for addresses that are not splits', async () => {
    provider.readContract.mockResolvedValue(`0x${'00'.repeat(32)}`)
    expect(await getSplitInfo(CHAIN_ID.BASE, address)).toMatchObject({
      isSplit: false,
      creationTxHash: null,
    })
  })
})

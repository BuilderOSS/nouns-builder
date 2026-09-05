import { recordSafeProposalHash } from '@buildeross/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { executeAppTransaction, executeAppTransactions } from './executeAppTransaction'

const { writeContract, waitForTransactionReceipt, awaitSubgraphSync } = vi.hoisted(
  () => ({
    writeContract: vi.fn(),
    waitForTransactionReceipt: vi.fn(),
    awaitSubgraphSync: vi.fn(),
  })
)

vi.mock('wagmi/actions', () => ({
  writeContract,
  waitForTransactionReceipt,
}))

vi.mock('../subgraph/requests/sync', () => ({
  awaitSubgraphSync,
}))

const request = (index: number) =>
  ({
    abi: [{ type: 'function', name: 'act', inputs: [], outputs: [] }],
    address: `0x${String(index).padStart(40, '0')}`,
    functionName: 'act',
    args: [],
  }) as any

const config = (connector?: { id: string; getProvider: () => Promise<unknown> }) =>
  ({
    state: {
      current: connector ? 'connection' : null,
      connections: new Map(connector ? [['connection', { connector }]] : []),
    },
  }) as any

describe('executeAppTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    waitForTransactionReceipt.mockResolvedValue({ status: 'success', blockNumber: 10n })
    awaitSubgraphSync.mockResolvedValue(true)
  })

  it('returns an empty result without contacting the wallet', async () => {
    await expect(
      executeAppTransactions({ config: config(), requests: [], chainId: 1 as any })
    ).resolves.toEqual([])
    expect(writeContract).not.toHaveBeenCalled()
  })

  it('proposes all requests as one Safe transaction', async () => {
    const hash = `0x${'a'.repeat(64)}` as `0x${string}`
    recordSafeProposalHash(hash)
    const provider = { request: vi.fn().mockResolvedValue(hash) }
    const result = await executeAppTransactions({
      config: config({ id: 'safeOwner', getProvider: async () => provider }),
      requests: [request(1), request(2)],
      chainId: 1 as any,
    })

    expect(result).toEqual({ kind: 'safe-proposed', hash })
    expect(provider.request).toHaveBeenCalledTimes(1)
    expect(provider.request.mock.calls[0][0].method).toBe('eth_sendTransaction')
    expect(provider.request.mock.calls[0][0].params[0].safeTransactions).toHaveLength(2)
    expect(writeContract).not.toHaveBeenCalled()
  })

  it('sends EOA requests sequentially and waits for each receipt', async () => {
    writeContract
      .mockResolvedValueOnce(`0x${'1'.repeat(64)}`)
      .mockResolvedValueOnce(`0x${'2'.repeat(64)}`)
    const result = await executeAppTransactions({
      config: config(),
      requests: [request(1), request(2)],
      chainId: 1 as any,
    })

    expect(result).toHaveLength(2)
    expect(writeContract).toHaveBeenCalledTimes(2)
    expect(waitForTransactionReceipt).toHaveBeenCalledTimes(2)
    expect(awaitSubgraphSync).toHaveBeenCalledTimes(2)
  })

  it('rejects a reverted threshold-one Safe batch', async () => {
    const hash = `0x${'b'.repeat(64)}` as `0x${string}`
    const provider = { request: vi.fn().mockResolvedValue(hash) }
    waitForTransactionReceipt.mockResolvedValue({ status: 'reverted', blockNumber: 10n })

    await expect(
      executeAppTransactions({
        config: config({ id: 'safeOwner', getProvider: async () => provider }),
        requests: [request(1), request(2)],
        chainId: 1 as any,
      })
    ).rejects.toThrow(`Transaction reverted: ${hash}`)
  })

  it('propagates Safe provider failures', async () => {
    const provider = {
      request: vi.fn().mockRejectedValue(new Error('wallet unavailable')),
    }

    await expect(
      executeAppTransactions({
        config: config({ id: 'safeOwner', getProvider: async () => provider }),
        requests: [request(1)],
        chainId: 1 as any,
      })
    ).rejects.toThrow('wallet unavailable')
  })
})

describe('executeAppTransaction', () => {
  it('does not wait for a receipt for a Safe proposal', async () => {
    const hash = `0x${'c'.repeat(64)}` as `0x${string}`
    recordSafeProposalHash(hash)
    writeContract.mockResolvedValue(hash)

    await expect(
      executeAppTransaction({ config: config(), request: request(1), chainId: 1 as any })
    ).resolves.toEqual({ kind: 'safe-proposed', hash })
    expect(waitForTransactionReceipt).not.toHaveBeenCalled()
  })
})

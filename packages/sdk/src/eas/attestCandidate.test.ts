import { CHAIN_ID } from '@buildeross/types'
import { decodeAbiParameters, getAddress, zeroHash } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { attestCandidate } from './attestCandidate'

const { simulateContract, executeAppTransaction } = vi.hoisted(() => ({
  simulateContract: vi.fn(),
  executeAppTransaction: vi.fn(),
}))

vi.mock('wagmi/actions', () => ({
  simulateContract,
}))

vi.mock('../transaction', () => ({
  executeAppTransaction,
}))

const target = '0x19a8eb80c1483ceaa1278b16c5d5ef0104f85905'

describe('attestCandidate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    simulateContract.mockResolvedValue({ request: {} })
    executeAppTransaction.mockResolvedValue({ kind: 'safe-proposed', hash: zeroHash })
  })

  it('encodes candidates with multiple transactions using EIP-55 target addresses', async () => {
    await attestCandidate({
      config: {} as any,
      chainId: CHAIN_ID.BASE,
      daoTokenAddress: target,
      candidateId: zeroHash,
      salt: zeroHash,
      targets: [target, target, target],
      values: [0n, 0n, 0n],
      calldatas: ['0x', '0x', '0x'],
      description: 'candidate',
    })

    const [attestParams] = simulateContract.mock.calls[0][1].args
    const [, , targets] = decodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'address[]' },
        { type: 'uint256[]' },
        { type: 'bytes[]' },
        { type: 'string' },
      ],
      attestParams.data.data
    )

    expect(targets).toEqual([getAddress(target), getAddress(target), getAddress(target)])
  })
})

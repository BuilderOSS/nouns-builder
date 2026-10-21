import { getAlchemyServerRpcUrl } from '@buildeross/constants/alchemy'
import { CHAIN_ID } from '@buildeross/types'
import {
  Address,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
  createPublicClient,
  encodeErrorResult,
  InsufficientFundsError as ViemInsufficientFundsError,
  RpcRequestError,
} from 'viem'
import { vi } from 'vitest'

import { BackendFailedError, InsufficientFundsError, InvalidRequestError } from './errors'
import { simulate, SimulationRequestBody } from './simulationService'

const simulateBlocks = vi.fn()

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({ simulateBlocks })),
  }
})

const revertError = (reason: string) =>
  new ContractFunctionRevertedError({
    abi: [],
    data: encodeErrorResult({
      abi: [
        {
          type: 'error',
          name: 'Error',
          inputs: [{ name: 'message', type: 'string' }],
        },
      ],
      errorName: 'Error',
      args: [reason],
    }),
    functionName: 'unknown',
  })

describe('simulationService', () => {
  beforeEach(() => {
    vi.stubEnv('ALCHEMY_API_KEY', 'test-key')
    simulateBlocks.mockReset()
    vi.mocked(createPublicClient).mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('simulate', () => {
    const tokenAddress: Address = '0x1234567890123456789012345678901234567890'
    const treasuryAddress: Address = '0xbcdfd67cce7bf4f49c0631ddd14eadff4d5ca15d'
    const request: SimulationRequestBody = {
      tokenAddress,
      treasuryAddress,
      chainId: CHAIN_ID.ETHEREUM,
      targets: [
        '0x7d8ba3e0745079b292f68e421d292c05da2d0721',
        '0xa7c8f84ec8cbed6e8fb793904cd1ec9ddfc9c35d',
      ],
      calldatas: ['0x', '0xc1'],
      values: ['0x1', '0x2'],
    }

    it('fails with mismatched input array lengths', async () => {
      await expect(
        simulate({
          tokenAddress,
          treasuryAddress,
          chainId: CHAIN_ID.ETHEREUM,
          targets: [
            '0x1111111111111111111111111111111111111111',
            '0x2222222222222222222222222222222222222222',
            '0x3333333333333333333333333333333333333333',
          ],
          calldatas: ['0xc1', '0xc2'],
          values: ['1'],
        })
      ).rejects.toThrow('Array length mismatch')

      await expect(
        simulate({
          tokenAddress,
          treasuryAddress,
          chainId: CHAIN_ID.ETHEREUM,
          targets: ['0x1111111111111111111111111111111111111111'],
          calldatas: ['0xc1'],
          values: ['1', '2'],
        })
      ).rejects.toThrow('Array length mismatch')

      await expect(
        simulate({
          tokenAddress,
          treasuryAddress,
          chainId: CHAIN_ID.ETHEREUM,
          targets: ['0x1111111111111111111111111111111111111111'],
          calldatas: ['0xc1', '0xc2'],
          values: ['1'],
        })
      ).rejects.toThrow('Array length mismatch')
    })

    it('fails with invalid treasury address', async () => {
      await expect(
        simulate({
          ...request,
          treasuryAddress: '0xnonsense' as Address,
        })
      ).rejects.toThrow(InvalidRequestError)
    })

    it('fails with invalid target address', async () => {
      await expect(
        simulate({
          ...request,
          targets: ['0xnonsense1', '0xa7c8f84ec8cbed6e8fb793904cd1ec9ddfc9c35d'],
        })
      ).rejects.toThrow(InvalidRequestError)
    })

    it('fails for chains without an alchemy network', async () => {
      await expect(simulate({ ...request, chainId: CHAIN_ID.FOUNDRY })).rejects.toThrow(
        InvalidRequestError
      )
      expect(simulateBlocks).not.toHaveBeenCalled()
    })

    it('simulates all calls from the treasury in a single block', async () => {
      simulateBlocks.mockResolvedValueOnce([
        {
          number: 100n,
          calls: [
            { status: 'success', gasUsed: 21000n },
            { status: 'success', gasUsed: 50000n },
          ],
        },
      ])

      await simulate(request)

      expect(createPublicClient).toHaveBeenCalledTimes(1)
      expect(simulateBlocks).toHaveBeenCalledWith({
        blocks: [
          {
            calls: [
              {
                account: treasuryAddress,
                to: request.targets[0],
                data: '0x',
                value: 1n,
              },
              {
                account: treasuryAddress,
                to: request.targets[1],
                data: '0xc1',
                value: 2n,
              },
            ],
          },
        ],
        validation: false,
      })
    })

    it('returns succeeded simulations', async () => {
      simulateBlocks.mockResolvedValueOnce([
        {
          number: 100n,
          calls: [
            { status: 'success', gasUsed: 21000n },
            { status: 'success', gasUsed: 50000n },
          ],
        },
      ])

      const response = await simulate(request)

      expect(response).toEqual({
        simulations: [
          {
            index: 0,
            status: true,
            gas_used: 21000,
            block_number: 100,
            from: treasuryAddress,
            to: request.targets[0],
            input: '0x',
            value: '0x1',
          },
          {
            index: 1,
            status: true,
            gas_used: 50000,
            block_number: 100,
            from: treasuryAddress,
            to: request.targets[1],
            input: '0xc1',
            value: '0x2',
          },
        ],
        success: true,
        totalGasUsed: '71000',
        error: null,
      })
    })

    it('returns failed simulations with the revert reason', async () => {
      simulateBlocks.mockResolvedValueOnce([
        {
          number: 100n,
          calls: [
            { status: 'success', gasUsed: 21000n },
            {
              status: 'failure',
              gasUsed: 30000n,
              error: revertError('Ownable: caller is not the owner'),
            },
          ],
        },
      ])

      const response = await simulate(request)

      expect(response.success).toBe(false)
      expect(response.totalGasUsed).toBe('51000')
      expect(response.simulations[0].status).toBe(true)
      expect(response.simulations[0].error).toBeUndefined()
      expect(response.simulations[1]).toMatchObject({
        index: 1,
        status: false,
        error: 'Ownable: caller is not the owner',
      })
    })

    it('decodes builder protocol custom errors and empty reverts', async () => {
      simulateBlocks.mockResolvedValueOnce([
        {
          number: 100n,
          calls: [
            {
              status: 'failure',
              gasUsed: 25000n,
              // ONLY_OWNER()
              error: new ContractFunctionRevertedError({
                abi: [],
                data: '0xd238ed59',
                functionName: 'unknown',
              }),
            },
            {
              status: 'failure',
              gasUsed: 25000n,
              error: new ContractFunctionZeroDataError({ functionName: 'unknown' }),
            },
          ],
        },
      ])

      const response = await simulate(request)

      expect(response.simulations[0].error).toBe('ONLY_OWNER()')
      expect(response.simulations[1].error).toBe('Execution reverted without a reason')
    })

    it('throws InsufficientFundsError when the treasury cannot cover the value', async () => {
      simulateBlocks.mockRejectedValueOnce(new ViemInsufficientFundsError())

      await expect(simulate(request)).rejects.toThrow(InsufficientFundsError)
    })

    it('fails with BackendFailedError when no alchemy credentials are configured', async () => {
      vi.stubEnv('ALCHEMY_API_KEY', '')
      vi.stubEnv('NEXT_PUBLIC_ALCHEMY_API_KEY', '')
      vi.stubEnv('ALCHEMY_JWT_PRIVATE_KEY', '')

      await expect(simulate(request)).rejects.toThrow(BackendFailedError)
      expect(simulateBlocks).not.toHaveBeenCalled()
    })

    it('calls the keyless alchemy url, keeping credentials out of error messages', async () => {
      simulateBlocks.mockRejectedValueOnce(
        new RpcRequestError({
          body: {},
          error: { code: -32000, message: 'boom' },
          url: getAlchemyServerRpcUrl(CHAIN_ID.ETHEREUM)!,
        })
      )

      const error = await simulate(request).catch((e) => e)

      expect(error).toBeInstanceOf(BackendFailedError)
      expect(error.message).toContain('boom')
      expect(error.message).not.toContain('test-key')
    })
  })
})

import { getAlchemyServerRpcUrl } from '@buildeross/constants/alchemy'
import { CHAIN_ID } from '@buildeross/types'
import {
  Address,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
  createPublicClient,
  encodeErrorResult,
  http,
  HttpRequestError,
  InsufficientFundsError as ViemInsufficientFundsError,
  parseEther,
  RpcRequestError,
  toHex,
} from 'viem'
import { vi } from 'vitest'

import { BackendFailedError, InvalidRequestError } from './errors'
import { simulate, SimulationRequestBody } from './simulationService'

const simulateBlocks = vi.fn()
const getBalance = vi.fn()

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({ simulateBlocks, getBalance })),
    http: vi.fn(actual.http),
  }
})

const rpcError = (code: number, message: string) =>
  new RpcRequestError({ body: {}, error: { code, message }, url: 'https://rpc.test' })

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
    getBalance.mockReset()
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

    describe('when a call fails the whole simulation request', () => {
      const proposal = (count: number): SimulationRequestBody => ({
        tokenAddress,
        treasuryAddress,
        chainId: CHAIN_ID.ETHEREUM,
        targets: Array.from(
          { length: count },
          (_, index) => `0x${String(index + 1).padStart(40, '0')}` as Address
        ),
        calldatas: Array.from({ length: count }, () => '0x'),
        values: Array.from({ length: count }, () => toHex(parseEther('1'))),
      })
      const indexOf = (to: Address) => Number(BigInt(to)) - 1

      // Like eth_simulateV1, the request fails at the first call `failCall` returns
      // an error for; calls in `revertingCalls` revert inside the block instead
      const mockSimulation = (
        failCall: (index: number) => Error | undefined,
        revertingCalls: number[] = []
      ) =>
        simulateBlocks.mockImplementation(async ({ blocks }) => {
          const [{ calls }] = blocks
          for (const call of calls) {
            const error = failCall(indexOf(call.to))
            if (error) throw error
          }
          return [
            {
              number: 100n,
              calls: calls.map((call: { to: Address }) =>
                revertingCalls.includes(indexOf(call.to))
                  ? { status: 'failure', gasUsed: 30000n, error: revertError('Nope') }
                  : { status: 'success', gasUsed: 21000n }
              ),
            },
          ]
        })
      const simulatedCalls = (callNumber: number) =>
        simulateBlocks.mock.calls[callNumber][0].blocks[0].calls.map(
          (call: { to: Address }) => indexOf(call.to)
        )

      beforeEach(() => {
        getBalance.mockResolvedValue(parseEther('0.5'))
      })

      it('marks the call the treasury cannot fund and simulates the others without it', async () => {
        mockSimulation((index) =>
          index === 1 ? new ViemInsufficientFundsError() : undefined
        )

        const response = await simulate(proposal(3))

        expect(response.success).toBe(false)
        expect(response.error).toBeNull()
        expect(response.simulations.map(({ status }) => status)).toEqual([
          true,
          false,
          true,
        ])
        expect(response.simulations[1]).toMatchObject({
          index: 1,
          gas_used: 0,
          error:
            "Treasury doesn't have enough ETH for this call (sends 1 ETH; treasury balance before the proposal: 0.5 ETH)",
        })
        expect(response.simulations[1].notSimulated).toBeUndefined()
        expect(response.simulations[2]).toMatchObject({
          gas_used: 21000,
          block_number: 100,
        })
        expect(getBalance).toHaveBeenCalledWith({ address: treasuryAddress })
        expect(simulatedCalls(simulateBlocks.mock.calls.length - 1)).toEqual([0, 2])
      })

      it.each([
        { position: 'the only call', count: 1, failing: 0 },
        { position: 'the first of 4 calls', count: 4, failing: 0 },
        { position: 'the last of 4 calls', count: 4, failing: 3 },
      ])('finds the failing call when it is $position', async ({ count, failing }) => {
        mockSimulation((index) =>
          index === failing
            ? rpcError(-38014, 'insufficient funds for transfer')
            : undefined
        )

        const response = await simulate(proposal(count))

        response.simulations.forEach((simulation, index) => {
          expect(simulation.status).toBe(index !== failing)
        })
        expect(response.simulations[failing].error).toMatch(
          /^Treasury doesn't have enough ETH for this call/
        )
      })

      it('still marks the call when the treasury balance cannot be read', async () => {
        getBalance.mockRejectedValue(new Error('rpc down'))
        mockSimulation((index) =>
          index === 0 ? new ViemInsufficientFundsError() : undefined
        )

        const response = await simulate(proposal(2))

        expect(response.simulations[0].error).toBe(
          "Treasury doesn't have enough ETH for this call (sends 1 ETH)"
        )
        expect(response.simulations[1].status).toBe(true)
      })

      it('reports other call errors with their details', async () => {
        mockSimulation((index) =>
          index === 1 ? rpcError(-38013, 'intrinsic gas too low') : undefined
        )

        const response = await simulate(proposal(2))

        expect(response.simulations[1]).toMatchObject({
          status: false,
          error: 'intrinsic gas too low',
        })
        expect(getBalance).not.toHaveBeenCalled()
      })

      it('marks every call that fails the request', async () => {
        mockSimulation((index) =>
          [0, 3].includes(index) ? new ViemInsufficientFundsError() : undefined
        )

        const response = await simulate(proposal(5))

        expect(response.simulations.map(({ status }) => status)).toEqual([
          false,
          true,
          true,
          false,
          true,
        ])
        expect(response.simulations.some(({ notSimulated }) => notSimulated)).toBe(false)
      })

      it('reports calls failing the request together with reverting calls', async () => {
        mockSimulation(
          (index) => (index === 0 ? new ViemInsufficientFundsError() : undefined),
          [2]
        )

        const response = await simulate(proposal(3))

        expect(response.simulations[0].error).toMatch(/doesn't have enough ETH/)
        expect(response.simulations[1].status).toBe(true)
        expect(response.simulations[2]).toMatchObject({ status: false, error: 'Nope' })
      })

      it('stops at the call that exceeds the block gas limit', async () => {
        mockSimulation((index) =>
          index >= 1 ? rpcError(-38015, 'block gas limit reached') : undefined
        )

        const response = await simulate(proposal(3))

        expect(response.simulations[0].status).toBe(true)
        expect(response.simulations[1]).toMatchObject({
          status: false,
          error: 'Proposal exceeds the block gas limit at this call',
        })
        expect(response.simulations[1].notSimulated).toBeUndefined()
        expect(response.simulations[2]).toMatchObject({
          status: false,
          notSimulated: true,
          error: 'The proposal exceeds the block gas limit at an earlier call',
        })
        // full run, two binary search probes, then the calls before the limit
        expect(simulateBlocks).toHaveBeenCalledTimes(4)
        expect(simulatedCalls(3)).toEqual([0])
      })

      it('stops after too many failing calls', async () => {
        mockSimulation(() => new ViemInsufficientFundsError())

        const response = await simulate(proposal(7))

        expect(response.simulations.slice(0, 5).every((s) => s.status === false)).toBe(
          true
        )
        expect(response.simulations.slice(0, 5).some((s) => s.notSimulated)).toBe(false)
        expect(response.simulations.slice(5)).toEqual([
          expect.objectContaining({
            notSimulated: true,
            error: 'Too many earlier calls failed',
          }),
          expect.objectContaining({
            notSimulated: true,
            error: 'Too many earlier calls failed',
          }),
        ])
      })

      it('stops when the simulation request budget runs out', async () => {
        mockSimulation(() => new ViemInsufficientFundsError())

        const response = await simulate(proposal(40))

        expect(simulateBlocks.mock.calls.length).toBeLessThanOrEqual(16)
        expect(response.simulations.slice(0, 2).every((s) => !s.notSimulated)).toBe(true)
        expect(response.simulations.slice(2)).toHaveLength(38)
        response.simulations.slice(2).forEach((simulation) => {
          expect(simulation).toMatchObject({
            status: false,
            notSimulated: true,
            error: 'The simulation budget ran out before this call',
          })
        })
      })

      it('aborts an in-flight request when the time budget runs out', async () => {
        vi.useFakeTimers()
        // a request that only settles when it is aborted
        const fetch = vi.fn(
          (_input: unknown, init?: RequestInit) =>
            new Promise<Response>((_, reject) =>
              init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
            )
        )
        vi.stubGlobal('fetch', fetch)
        simulateBlocks
          .mockRejectedValueOnce(new ViemInsufficientFundsError())
          .mockImplementationOnce(async () => {
            const { fetchFn } = vi.mocked(http).mock.lastCall![1]!
            await fetchFn!('https://rpc.test', {})
          })

        try {
          const response = simulate(proposal(3))
          await vi.advanceTimersByTimeAsync(20_000)

          expect(fetch).toHaveBeenCalledTimes(1)
          expect((await response).simulations).toEqual(
            Array.from({ length: 3 }, () =>
              expect.objectContaining({
                status: false,
                notSimulated: true,
                error: 'The simulation budget ran out before this call',
              })
            )
          )
          expect(simulateBlocks).toHaveBeenCalledTimes(2)
        } finally {
          vi.unstubAllGlobals()
          vi.useRealTimers()
        }
      })

      it('fails with BackendFailedError for request-level errors', async () => {
        simulateBlocks.mockRejectedValue(rpcError(-38026, 'too many calls'))

        await expect(simulate(proposal(2))).rejects.toThrow(BackendFailedError)
        expect(simulateBlocks).toHaveBeenCalledTimes(1)
      })

      it('fails with BackendFailedError when a search request fails', async () => {
        simulateBlocks
          .mockRejectedValueOnce(new ViemInsufficientFundsError())
          .mockRejectedValueOnce(
            new HttpRequestError({ url: 'https://rpc.test', status: 429 })
          )

        await expect(simulate(proposal(4))).rejects.toThrow(BackendFailedError)
      })
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

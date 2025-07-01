import axios from 'axios'
import { Address, parseEther } from 'viem'
import { vi } from 'vitest'

import { CHAIN_ID } from 'src/typings'

import { InvalidRequestError } from './errors'
import { SimulationOutput, SimulationRequestBody, simulate } from './simulationService'

vi.mock('axios', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('simulationService', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('simulate', () => {
    const treasuryAddress: Address = '0xbcdfd67cce7bf4f49c0631ddd14eadff4d5ca15d'
    const request: SimulationRequestBody = {
      treasuryAddress,
      chainId: CHAIN_ID.ETHEREUM,
      targets: [
        '0x7d8ba3e0745079b292f68e421d292c05da2d0721',
        '0xa7c8f84ec8cbed6e8fb793904cd1ec9ddfc9c35d',
      ],
      calldatas: ['0x', '0x'],
      values: ['1', '2'],
    }

    const sampleOutput: SimulationOutput = {
      index: 0,
      id: '',
      status: true,
      url: `https://dashboard.tenderly.co/shared/simulation/<simulationId>`,
      gas_used: Number(parseEther('0.005')),
      block_number: 0,
      from: treasuryAddress,
      to: treasuryAddress,
      input: treasuryAddress,
      value: '0',
    }

    it('fails with mismatched input array lengths', async () => {
      expect(() =>
        simulate({
          treasuryAddress,
          chainId: CHAIN_ID.ETHEREUM,
          targets: ['0xt1', '0xt2', '0xt3'],
          calldatas: ['0xc1', '0xc2'],
          values: ['v1, v2'],
        })
      ).rejects.toThrow(InvalidRequestError)

      expect(() =>
        simulate({
          treasuryAddress,
          chainId: CHAIN_ID.ETHEREUM,
          targets: ['0xt1'],
          calldatas: ['0xc1'],
          values: ['v1, v2'],
        })
      ).rejects.toThrow(InvalidRequestError)

      expect(() =>
        simulate({
          treasuryAddress,
          chainId: CHAIN_ID.ETHEREUM,
          targets: ['0xt1'],
          calldatas: ['0xc1', '0xc2'],
          values: ['v1, v2'],
        })
      ).rejects.toThrow(InvalidRequestError)
    })

    it('fails with invalid treasury address', async () => {
      expect(() =>
        simulate({
          ...request,
          treasuryAddress: '0xnonsense' as Address,
        })
      ).rejects.toThrow(InvalidRequestError)
    })

    it('fails with invalid target address', async () => {
      expect(() =>
        simulate({
          ...request,
          targets: ['0xnonsense1', '0xa7c8f84ec8cbed6e8fb793904cd1ec9ddfc9c35d'],
        })
      ).rejects.toThrow(InvalidRequestError)
    })

    it('returns succeeded simulations', async () => {
      const simulationId = 'simulationId'

      const expectedSimulations: SimulationOutput[] = [
        {
          ...sampleOutput,
          index: 0,
          id: simulationId,
          status: true,
          url: `https://dashboard.tenderly.co/shared/simulation/${simulationId}`,
          gas_used: Number(parseEther('0.005')),
        },
        {
          ...sampleOutput,
          index: 1,
          id: simulationId,
          status: true,
          url: `https://dashboard.tenderly.co/shared/simulation/${simulationId}`,
          gas_used: Number(parseEther('0.005')),
        },
      ]

      vi.mocked(axios.post).mockResolvedValueOnce({
        status: 200,
        data: { simulation_results: expectedSimulations.map((s) => ({ simulation: s })) },
      })

      const response = await simulate(request)

      expect(response).toEqual({
        simulations: expectedSimulations,
        success: true,
        totalGasUsed: parseEther('0.01').toString(),
      })
    })

    it('returns simulations with an error', async () => {
      const simulationId = 'simulationId'

      const expectedSimulations: SimulationOutput[] = [
        {
          ...sampleOutput,
          index: 0,
          id: simulationId,
          status: true,
          url: `https://dashboard.tenderly.co/shared/simulation/${simulationId}`,
          gas_used: Number(parseEther('0.005')),
        },
        {
          ...sampleOutput,
          index: 1,
          id: simulationId,
          status: false,
          url: `https://dashboard.tenderly.co/shared/simulation/${simulationId}`,
          gas_used: Number(parseEther('0.005')),
        },
      ]

      vi.mocked(axios.post).mockResolvedValueOnce({
        status: 200,
        data: { simulation_results: expectedSimulations.map((s) => ({ simulation: s })) },
      })

      const response = await simulate(request)

      expect(response).toEqual({
        simulations: expectedSimulations,
        success: false,
        totalGasUsed: parseEther('0.01').toString(),
      })
    })
  })
})

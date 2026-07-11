// NOTE/TODO: Currently this service only supports Tenderly for transaction simulation.
// Ideally we should support multiple simulation providers (e.g., Foundry fork tests,
// Ganache, Hardhat Network, etc.) and allow developers to choose between them.
// Additionally, the API endpoint is hardcoded to /api/simulate, which means developers
// must implement the same endpoint structure in their applications for this service to work.

import { AddressType, CHAIN_ID, ErrorResult, SimulationResult } from '@buildeross/types'
import axios from 'axios'
import { toHex } from 'viem'

const CHAINS_TO_SIMULATE = [
  CHAIN_ID.ETHEREUM,
  CHAIN_ID.SEPOLIA,
  CHAIN_ID.OPTIMISM,
  CHAIN_ID.OPTIMISM_SEPOLIA,
  CHAIN_ID.BASE,
  CHAIN_ID.BASE_SEPOLIA,
  CHAIN_ID.ZORA,
  CHAIN_ID.ZORA_SEPOLIA,
]

export interface SimulateTransactionsParams {
  treasuryAddress: AddressType
  chainId: CHAIN_ID
  calldatas: string[]
  values: bigint[]
  targets: string[]
}

export async function simulateTransactions(
  params: SimulateTransactionsParams
): Promise<SimulationResult> {
  const { treasuryAddress, chainId, calldatas, values, targets } = params

  if (!CHAINS_TO_SIMULATE.includes(chainId)) {
    throw new Error(`Chain ${chainId} is not supported for simulation`)
  }

  try {
    const response = await axios.post<SimulationResult>(`/api/simulate`, {
      treasuryAddress,
      chainId,
      calldatas,
      values: values.map((x) => toHex(x)),
      targets,
    })

    return response.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as ErrorResult
      throw new Error(data.error || 'Simulation failed')
    } else {
      throw new Error('Unable to simulate transactions')
    }
  }
}

export function isSimulationSupported(chainId: number): boolean {
  return CHAINS_TO_SIMULATE.includes(chainId)
}

import {
  BytesType,
  CHAIN_ID,
  SimulationOutput,
  SimulationResult,
} from '@buildeross/types'
import axios from 'axios'
import { Address, isAddress } from 'viem'

import { InvalidRequestError } from './errors'

export type SimulationRequestBody = {
  treasuryAddress: Address
  chainId: CHAIN_ID
  targets: Address[]
  calldatas: BytesType[]
  values: string[]
}

const TENDERLY_USER = process.env.TENDERLY_USER
const TENDERLY_PROJECT = process.env.TENDERLY_PROJECT
const TENDERLY_ACCESS_KEY = process.env.TENDERLY_ACCESS_KEY

const getSimulationUrl = (simulation: SimulationOutput) => {
  return `https://dashboard.tenderly.co/shared/simulation/${simulation.id}`
}

const shareSimulation = async (simulation: SimulationOutput) => {
  await axios.post(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulations/${simulation.id}/share`,
    {},
    {
      headers: {
        'X-Access-Key': TENDERLY_ACCESS_KEY as string,
      },
    }
  )
}

const simulateTransaction = async ({
  chainId,
  treasuryAddress,
  targets,
  calldatas,
  values,
}: SimulationRequestBody): Promise<SimulationOutput[]> => {
  const simulation = await axios.post(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate-bundle`,
    {
      simulations: targets.map((target, index) => ({
        network_id: chainId.toString(),
        save: false,
        save_if_fails: true,
        simulation_type: 'full',
        from: treasuryAddress,
        to: target,
        value: values[index].toString(),
        input: calldatas[index],
      })),
    },
    {
      headers: {
        'X-Access-Key': TENDERLY_ACCESS_KEY as string,
      },
    }
  )

  return simulation.data.simulation_results.map(
    (s: { simulation: SimulationOutput }) => s.simulation
  )
}

export async function simulate({
  treasuryAddress,
  chainId,
  targets,
  calldatas,
  values,
}: SimulationRequestBody): Promise<SimulationResult> {
  // Validate inputs
  if (targets?.length !== calldatas?.length && targets?.length !== values?.length) {
    throw new InvalidRequestError('Array length mismatch')
  }
  if (!isAddress(treasuryAddress)) {
    throw new InvalidRequestError('Invalid treasury address')
  }
  const invalidAddresses = targets.filter((target) => !isAddress(target))
  if (invalidAddresses.length > 0) {
    throw new InvalidRequestError(
      `Invalid target addresses: [${invalidAddresses.join(',')}]`
    )
  }

  const simulations = await simulateTransaction({
    chainId,
    treasuryAddress,
    targets,
    calldatas,
    values,
  })

  const simulationSucceeded = simulations.every((s) => s.status)
  const totalGasUsed = simulations.reduce((total, s) => total + (s.gas_used ?? 0), 0)

  const haveSimulationToShare = simulations.some((s) => !!s.id)

  if (!simulationSucceeded && haveSimulationToShare) {
    await Promise.all(simulations.filter((s) => !s.status && s.id).map(shareSimulation))
  }

  return {
    simulations: simulations.map((s, i) => ({
      ...s,
      index: i,
      url: s.id ? getSimulationUrl(s) : '',
    })),
    success: simulationSucceeded,
    totalGasUsed: totalGasUsed.toString(),
    error: haveSimulationToShare ? null : 'Internal Server Error',
  }
}

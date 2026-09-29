import { EAS_CONTRACT_ADDRESS, easAbi } from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'
import type { Hex } from 'viem'
import type { Config } from 'wagmi'
import { simulateContract } from 'wagmi/actions'

import { executeAppTransaction } from '../transaction'
import { extractAttestationUIDs } from './utils'

export interface MultiAttestationRequest {
  schema: Hex
  data: {
    recipient: `0x${string}`
    expirationTime: bigint
    revocable: boolean
    refUID: `0x${string}`
    data: `0x${string}`
    value: bigint
  }[]
}

export interface MultiAttestParams {
  config: Config
  chainId: CHAIN_ID
  requests: MultiAttestationRequest[]
}

export type MultiAttestResult =
  | {
      kind: 'mined'
      attestationUIDs: Hex[]
      transactionHash: Hex
    }
  | {
      kind: 'safe-proposed'
      transactionHash: Hex
    }

/**
 * Submit multiple attestations in a single transaction using multiAttest
 * This is more gas efficient than individual attestations
 *
 * @param params - Multi-attestation parameters
 * @returns Array of attestation UIDs and transaction hash
 */
export async function multiAttest(params: MultiAttestParams): Promise<MultiAttestResult> {
  const { config, chainId, requests } = params

  // Get EAS contract address for this chain
  const easAddress = EAS_CONTRACT_ADDRESS[chainId]
  if (!easAddress) {
    throw new Error(`EAS not supported on chain ${chainId}`)
  }

  // Validate we have at least one request
  if (requests.length === 0) {
    throw new Error('At least one attestation request is required')
  }

  // 1. Simulate the transaction
  const simulation = await simulateContract(config, {
    address: easAddress,
    abi: easAbi,
    functionName: 'multiAttest',
    chainId: chainId,
    args: [requests],
  })

  // 2. Write the transaction
  const result = await executeAppTransaction({
    config,
    request: simulation.request,
    chainId,
  })

  // Handle Safe proposals vs mined transactions
  if (result.kind === 'safe-proposed') {
    return {
      kind: 'safe-proposed',
      transactionHash: result.hash,
    }
  }

  // Extract attestation UIDs from logs for mined transactions
  const attestationUIDs = extractAttestationUIDs(result.receipt, easAddress)

  // Validate we got the expected number of UIDs
  const totalAttestations = requests.reduce((sum, req) => sum + req.data.length, 0)
  if (attestationUIDs.length !== totalAttestations) {
    throw new Error(
      `Expected ${totalAttestations} attestation UIDs but got ${attestationUIDs.length}`
    )
  }

  return {
    kind: 'mined',
    attestationUIDs,
    transactionHash: result.hash,
  }
}

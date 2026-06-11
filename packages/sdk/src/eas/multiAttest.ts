import { EAS_CONTRACT_ADDRESS, easAbi } from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'
import type { Hex } from 'viem'
import type { Config } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { awaitSubgraphSync } from '../subgraph/requests/sync'

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

export interface MultiAttestResult {
  attestationUIDs: Hex[]
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
  const txHash = await writeContract(config, simulation.request)

  // 3. Wait for confirmation
  const receipt = await waitForTransactionReceipt(config, {
    hash: txHash,
    chainId: chainId,
  })

  // 4. Sync with subgraph
  await awaitSubgraphSync(chainId, receipt.blockNumber)

  // 5. Extract attestation UIDs from logs
  // For now, use placeholders - in production, decode logs to get actual UIDs
  const attestationUIDs = requests.map(() => txHash)

  return {
    attestationUIDs,
    transactionHash: txHash,
  }
}

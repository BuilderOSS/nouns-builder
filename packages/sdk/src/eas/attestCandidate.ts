import {
  AttestationParams,
  EAS_CONTRACT_ADDRESS,
  easAbi,
  PROPOSAL_CANDIDATE_SCHEMA,
  PROPOSAL_CANDIDATE_SCHEMA_UID,
} from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import type { Hex } from 'viem'
import { getAddress, zeroHash } from 'viem'
import type { Config } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { awaitSubgraphSync } from '../subgraph/requests/sync'

export interface CandidateAttestationParams {
  config: Config
  chainId: CHAIN_ID
  daoTokenAddress: string
  candidateId: Hex
  salt: Hex
  versionNumber: number
  targets: string[]
  values: bigint[]
  calldatas: Hex[]
  description: string
  proposalId?: Hex // Optional: if this will become a specific proposal
}

export interface CandidateAttestationResult {
  attestationUID: Hex
  transactionHash: Hex
}

/**
 * Submits a candidate attestation to EAS
 * @param params - The candidate attestation parameters
 * @returns The attestation UID and transaction hash
 */
export async function attestCandidate(
  params: CandidateAttestationParams
): Promise<CandidateAttestationResult> {
  const {
    config,
    chainId,
    daoTokenAddress,
    candidateId,
    salt,
    versionNumber,
    targets,
    values,
    calldatas,
    description,
    proposalId = zeroHash,
  } = params

  // Get EAS contract address for this chain
  const easAddress = EAS_CONTRACT_ADDRESS[chainId]
  if (!easAddress) {
    throw new Error(`EAS not supported on chain ${chainId}`)
  }

  // 1. Encode data using SchemaEncoder
  const schemaEncoder = new SchemaEncoder(PROPOSAL_CANDIDATE_SCHEMA)
  const encodedData = schemaEncoder.encodeData([
    { name: 'candidateId', value: candidateId, type: 'bytes32' },
    { name: 'salt', value: salt, type: 'bytes32' },
    { name: 'versionNumber', value: versionNumber, type: 'uint64' },
    { name: 'targets', value: targets, type: 'address[]' },
    { name: 'values', value: values, type: 'uint256[]' },
    { name: 'calldatas', value: calldatas, type: 'bytes[]' },
    { name: 'description', value: description, type: 'string' },
    { name: 'proposalId', value: proposalId, type: 'bytes32' },
  ]) as Hex

  // 2. Create attestation params
  const attestParams: AttestationParams = {
    schema: PROPOSAL_CANDIDATE_SCHEMA_UID,
    data: {
      recipient: getAddress(daoTokenAddress),
      expirationTime: 0n,
      revocable: true,
      refUID: zeroHash,
      data: encodedData,
      value: 0n,
    },
  }

  // 3. Simulate the transaction
  const simulation = await simulateContract(config, {
    address: easAddress,
    abi: easAbi,
    functionName: 'attest',
    chainId: chainId,
    args: [attestParams],
  })

  // 4. Write the transaction
  const txHash = await writeContract(config, simulation.request)

  // 5. Wait for confirmation
  const receipt = await waitForTransactionReceipt(config, {
    hash: txHash,
    chainId: chainId,
  })

  // 6. Sync with subgraph
  await awaitSubgraphSync(chainId, receipt.blockNumber)

  // 7. Extract attestation UID from logs
  // The attest function returns the attestation UID
  // For now, we'll use the transaction hash as a placeholder
  // In a real implementation, you'd decode the logs to get the actual UID
  const attestationUID = txHash

  return {
    attestationUID,
    transactionHash: txHash,
  }
}

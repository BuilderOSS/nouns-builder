import {
  AttestationParams,
  EAS_CONTRACT_ADDRESS,
  easAbi,
  PROPOSAL_CANDIDATE_SCHEMA_UID,
} from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'
import type { Hex } from 'viem'
import { encodeAbiParameters, getAddress, zeroHash } from 'viem'
import type { Config } from 'wagmi'
import { simulateContract } from 'wagmi/actions'

import { executeAppTransaction } from '../transaction'
import { extractSingleAttestationUID } from './utils'

export interface CandidateAttestationParams {
  config: Config
  chainId: CHAIN_ID
  daoTokenAddress: string
  candidateId: Hex
  salt: Hex
  targets: string[]
  values: bigint[]
  calldatas: Hex[]
  description: string
}

export type CandidateAttestationResult =
  | {
      kind: 'mined'
      attestationUID: Hex
      transactionHash: Hex
    }
  | {
      kind: 'safe-proposed'
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
    targets,
    values,
    calldatas,
    description,
  } = params

  // Get EAS contract address for this chain
  const easAddress = EAS_CONTRACT_ADDRESS[chainId]
  if (!easAddress) {
    throw new Error(`EAS not supported on chain ${chainId}`)
  }

  const encodedData = encodeAbiParameters(
    [
      { name: 'candidateId', type: 'bytes32' },
      { name: 'salt', type: 'bytes32' },
      { name: 'targets', type: 'address[]' },
      { name: 'values', type: 'uint256[]' },
      { name: 'calldatas', type: 'bytes[]' },
      { name: 'description', type: 'string' },
    ],
    [candidateId, salt, targets.map(getAddress), values, calldatas, description]
  )

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

  // Extract attestation UID from logs for mined transactions
  const attestationUID = extractSingleAttestationUID(result.receipt, easAddress)

  return {
    kind: 'mined',
    attestationUID,
    transactionHash: result.hash,
  }
}

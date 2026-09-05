import {
  AttestationParams,
  CANDIDATE_COMMENT_SCHEMA_UID,
  EAS_CONTRACT_ADDRESS,
  easAbi,
} from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'
import type { Hex } from 'viem'
import { encodeAbiParameters, getAddress, zeroHash } from 'viem'
import type { Config } from 'wagmi'
import { simulateContract } from 'wagmi/actions'

import { executeAppTransaction } from '../transaction'
import { extractSingleAttestationUID } from './utils'

export enum CandidateVoteSupportEnum {
  FOR = 0,
  AGAINST = 1,
  ABSTAIN = 2,
  NONE = 3,
}

export interface CandidateCommentParams {
  config: Config
  chainId: CHAIN_ID
  daoTokenAddress: string
  candidateId: Hex
  support: CandidateVoteSupportEnum
  comment: string
  parentCommentUID?: Hex
}

export type CandidateCommentResult =
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
 * Submits a candidate comment/vote attestation to EAS
 * Comments and votes are combined in a single schema
 * @param params - The comment parameters
 * @returns The attestation UID and transaction hash
 */
export async function attestCandidateComment(
  params: CandidateCommentParams
): Promise<CandidateCommentResult> {
  const {
    config,
    chainId,
    daoTokenAddress,
    candidateId,
    support,
    comment,
    parentCommentUID = zeroHash,
  } = params

  // Get EAS contract address for this chain
  const easAddress = EAS_CONTRACT_ADDRESS[chainId]
  if (!easAddress) {
    throw new Error(`EAS not supported on chain ${chainId}`)
  }

  const encodedData = encodeAbiParameters(
    [
      { name: 'candidateId', type: 'bytes32' },
      { name: 'support', type: 'uint8' },
      { name: 'comment', type: 'string' },
      { name: 'parentCommentUID', type: 'bytes32' },
    ],
    [candidateId, support, comment, parentCommentUID]
  )

  // 2. Create attestation params
  const attestParams: AttestationParams = {
    schema: CANDIDATE_COMMENT_SCHEMA_UID,
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

import {
  AttestationParams,
  CANDIDATE_COMMENT_SCHEMA,
  CANDIDATE_COMMENT_SCHEMA_UID,
  EAS_CONTRACT_ADDRESS,
  easAbi,
} from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import type { Hex } from 'viem'
import { getAddress, zeroHash } from 'viem'
import type { Config } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { awaitSubgraphSync } from '../subgraph/requests/sync'

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

export interface CandidateCommentResult {
  attestationUID: Hex
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

  // 1. Encode data using SchemaEncoder
  const schemaEncoder = new SchemaEncoder(CANDIDATE_COMMENT_SCHEMA)
  const encodedData = schemaEncoder.encodeData([
    { name: 'candidateId', value: candidateId, type: 'bytes32' },
    { name: 'support', value: support, type: 'uint8' },
    { name: 'comment', value: comment, type: 'string' },
    { name: 'parentCommentUID', value: parentCommentUID, type: 'bytes32' },
  ]) as Hex

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
  const txHash = await writeContract(config, simulation.request)

  // 5. Wait for confirmation
  const receipt = await waitForTransactionReceipt(config, {
    hash: txHash,
    chainId: chainId,
  })

  // 6. Sync with subgraph
  await awaitSubgraphSync(chainId, receipt.blockNumber)

  // 7. Use transaction hash as attestation UID
  const attestationUID = txHash

  return {
    attestationUID,
    transactionHash: txHash,
  }
}

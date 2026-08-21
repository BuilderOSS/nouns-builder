import {
  CANDIDATE_COMMENT_SCHEMA_UID,
  CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID,
} from '@buildeross/constants/eas'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import type { Hex, WalletClient } from 'viem'
import { encodeAbiParameters, getAddress, zeroHash } from 'viem'
import type { Config } from 'wagmi'

import type { CandidateVoteSupportEnum } from './attestCandidateComment'
import { multiAttest, type MultiAttestationRequest } from './multiAttest'

export interface CommentWithSignatureParams {
  config: Config
  chainId: CHAIN_ID
  walletClient: WalletClient
  daoTokenAddress: string
  governorAddress: AddressType
  tokenSymbol: string
  candidateId: Hex
  proposalHash: Hex
  signer: AddressType
  proposer: AddressType
  nonce: bigint
  deadline: number
  support: CandidateVoteSupportEnum
  comment: string
  parentCommentUID?: Hex
}

export interface CommentWithSignatureResult {
  commentUID: Hex
  signatureUID: Hex
  transactionHash: Hex
  signature: Hex
}

/**
 * Submit both a comment/vote AND a sponsor signature in a single transaction
 * This is more efficient than two separate transactions
 *
 * @param params - Combined comment and signature parameters
 * @returns The attestation UIDs for both, transaction hash, and the generated signature
 */
export async function attestCommentWithSignature(
  params: CommentWithSignatureParams
): Promise<CommentWithSignatureResult> {
  const {
    config,
    chainId,
    walletClient,
    daoTokenAddress,
    governorAddress,
    tokenSymbol,
    candidateId,
    proposalHash: proposalId,
    signer,
    proposer,
    nonce,
    deadline,
    support,
    comment,
    parentCommentUID = zeroHash,
  } = params

  // 1. Generate EIP-712 signature for the proposal
  const domain = {
    name: `${tokenSymbol} GOV`,
    version: '1',
    chainId: Number(chainId),
    verifyingContract: governorAddress,
  } as const

  const types = {
    Proposal: [
      { name: 'proposer', type: 'address' },
      { name: 'proposalId', type: 'bytes32' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  } as const

  const message = {
    proposer,
    proposalId,
    nonce,
    deadline: BigInt(deadline),
  } as const

  let signature: Hex
  try {
    signature = await walletClient.signTypedData({
      account: signer,
      domain,
      types,
      primaryType: 'Proposal',
      message,
    })
  } catch (error) {
    throw new Error(
      `Failed to generate signature: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }

  const commentData = encodeAbiParameters(
    [
      { name: 'candidateId', type: 'bytes32' },
      { name: 'support', type: 'uint8' },
      { name: 'comment', type: 'string' },
      { name: 'parentCommentUID', type: 'bytes32' },
    ],
    [candidateId, support, comment, parentCommentUID]
  )

  const signatureData = encodeAbiParameters(
    [
      { name: 'candidateId', type: 'bytes32' },
      { name: 'proposalId', type: 'bytes32' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    [candidateId, proposalId, nonce, BigInt(deadline), signature]
  )

  // 4. Create multi-attestation requests
  const recipient = getAddress(daoTokenAddress)
  const requests: MultiAttestationRequest[] = [
    {
      schema: CANDIDATE_COMMENT_SCHEMA_UID,
      data: [
        {
          recipient,
          expirationTime: 0n,
          revocable: true,
          refUID: zeroHash,
          data: commentData,
          value: 0n,
        },
      ],
    },
    {
      schema: CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID,
      data: [
        {
          recipient,
          expirationTime: 0n,
          revocable: true,
          refUID: zeroHash,
          data: signatureData,
          value: 0n,
        },
      ],
    },
  ]

  // 5. Submit both attestations in one transaction
  const result = await multiAttest({
    config,
    chainId,
    requests,
  })

  return {
    commentUID: result.attestationUIDs[0],
    signatureUID: result.attestationUIDs[1],
    transactionHash: result.transactionHash,
    signature,
  }
}

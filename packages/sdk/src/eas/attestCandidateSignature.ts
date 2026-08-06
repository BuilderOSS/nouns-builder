import {
  AttestationParams,
  CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID,
  EAS_CONTRACT_ADDRESS,
  easAbi,
} from '@buildeross/constants/eas'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import type { Hex, WalletClient } from 'viem'
import { encodeAbiParameters, getAddress, zeroHash } from 'viem'
import type { Config } from 'wagmi'
import { simulateContract } from 'wagmi/actions'

import { executeAppTransaction } from '../transaction'
import { extractSingleAttestationUID } from './utils'

export interface CandidateSignatureParams {
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
}

export type CandidateSignatureResult =
  | {
      kind: 'mined'
      attestationUID: Hex
      transactionHash: Hex
      signature: Hex
    }
  | {
      kind: 'safe-proposed'
      transactionHash: Hex
      signature: Hex
    }

/**
 * Generate an EIP-712 signature for a candidate and submit it as an attestation
 * This signature can later be used with proposeBySigs to create the proposal
 *
 * @param params - Signature parameters
 * @returns The attestation UID, transaction hash, and the generated signature
 */
export async function attestCandidateSignature(
  params: CandidateSignatureParams
): Promise<CandidateSignatureResult> {
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
  } = params

  // Get EAS contract address for this chain
  const easAddress = EAS_CONTRACT_ADDRESS[chainId]
  if (!easAddress) {
    throw new Error(`EAS not supported on chain ${chainId}`)
  }

  // 1. Generate EIP-712 signature for the proposal
  // EIP-712 domain
  const domain = {
    name: `${tokenSymbol} GOV`,
    version: '1',
    chainId: Number(chainId),
    verifyingContract: governorAddress,
  } as const

  // EIP-712 types for PROPOSAL_TYPEHASH
  // keccak256("Proposal(address proposer,bytes32 proposalId,uint256 nonce,uint256 deadline)")
  const types = {
    Proposal: [
      { name: 'proposer', type: 'address' },
      { name: 'proposalId', type: 'bytes32' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  } as const

  // Message to sign
  const message = {
    proposer,
    proposalId,
    nonce,
    deadline: BigInt(deadline),
  } as const

  let signature: Hex
  try {
    // Sign typed data
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

  const encodedData = encodeAbiParameters(
    [
      { name: 'candidateId', type: 'bytes32' },
      { name: 'proposalId', type: 'bytes32' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    [candidateId, proposalId, nonce, BigInt(deadline), signature]
  )

  // 3. Create attestation params
  const attestParams: AttestationParams = {
    schema: CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID,
    data: {
      recipient: getAddress(daoTokenAddress),
      expirationTime: 0n,
      revocable: true,
      refUID: zeroHash,
      data: encodedData,
      value: 0n,
    },
  }

  // 4. Simulate the transaction
  const simulation = await simulateContract(config, {
    address: easAddress,
    abi: easAbi,
    functionName: 'attest',
    chainId: chainId,
    args: [attestParams],
  })

  // 5. Write the transaction
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
      signature,
    }
  }

  // Extract attestation UID from logs for mined transactions
  const attestationUID = extractSingleAttestationUID(result.receipt, easAddress)

  return {
    kind: 'mined',
    attestationUID,
    transactionHash: result.hash,
    signature,
  }
}

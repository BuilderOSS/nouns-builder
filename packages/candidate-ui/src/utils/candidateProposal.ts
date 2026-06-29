import { hashProposal } from '@buildeross/sdk/contract'
import { encodeAbiParameters, keccak256 } from 'viem'

export const CANDIDATE_SIGNATURE_VALIDITY_DAYS = 7
export const CANDIDATE_SIGNATURE_VALIDITY_SECONDS =
  CANDIDATE_SIGNATURE_VALIDITY_DAYS * 24 * 60 * 60

type CandidateProposalInput = {
  tokenAddress: `0x${string}`
  proposer: `0x${string}`
  salt: `0x${string}`
}

type CandidateProposalHashInput = {
  targets: `0x${string}`[]
  values: Array<string | bigint>
  calldatas: `0x${string}`[]
  description: string
  proposer: `0x${string}`
}

export const getCandidateId = ({
  tokenAddress,
  proposer,
  salt,
}: CandidateProposalInput) => {
  return keccak256(
    encodeAbiParameters(
      [
        { name: 'tokenAddress', type: 'address' },
        { name: 'proposer', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      [tokenAddress, proposer, salt]
    )
  )
}

export const getCandidateProposalId = ({
  targets,
  values,
  calldatas,
  description,
  proposer,
}: CandidateProposalHashInput) => {
  return hashProposal({
    targets,
    values: values.map((value) => BigInt(value)),
    calldatas,
    description,
    proposer,
  })
}

/**
 * Check if a signature has expired based on its deadline
 * @param deadline - Unix timestamp in seconds (as BigInt) when signature expires
 * @returns true if signature has expired, false otherwise
 */
export const isSignatureExpired = (deadline: bigint): boolean => {
  const now = Math.floor(Date.now() / 1000)
  return BigInt(now) > deadline
}

/**
 * Filter signatures to only include valid ones:
 * - Excludes signatures by the proposer (can't sign their own proposal)
 * - Excludes expired signatures (deadline has passed)
 *
 * @param signatures - Array of signature objects with deadline and signer fields
 * @param proposer - Address of the proposal creator
 * @returns Filtered array of valid signatures
 */
export const filterValidSignatures = <T extends { deadline: bigint; signer: string }>(
  signatures: T[],
  proposer: string
): T[] => {
  return signatures.filter(
    (signature) =>
      signature.signer.toLowerCase() !== proposer.toLowerCase() &&
      !isSignatureExpired(signature.deadline)
  )
}

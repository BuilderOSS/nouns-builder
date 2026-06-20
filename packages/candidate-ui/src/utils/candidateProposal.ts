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

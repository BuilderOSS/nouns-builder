import { hashProposal } from '@buildeross/sdk/contract'

export const CANDIDATE_SIGNATURE_VALIDITY_DAYS = 7
export const CANDIDATE_SIGNATURE_VALIDITY_SECONDS =
  CANDIDATE_SIGNATURE_VALIDITY_DAYS * 24 * 60 * 60

type CandidateProposalInput = {
  targets: `0x${string}`[]
  values: Array<string | bigint>
  calldatas: `0x${string}`[]
  description: string
  proposer: `0x${string}`
}

export const getCandidateProposalId = ({
  targets,
  values,
  calldatas,
  description,
  proposer,
}: CandidateProposalInput) => {
  return hashProposal({
    targets,
    values: values.map((value) => BigInt(value)),
    calldatas,
    description,
    proposer,
  })
}

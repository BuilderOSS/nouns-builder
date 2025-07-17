import { ProposalState } from '@buildeross/types'

import { parseBlockchainDate } from 'src/utils/parseBlockchainDate'

export const isProposalOpen = (state: ProposalState): boolean => {
  if (
    state === ProposalState.Queued ||
    state === ProposalState.Succeeded ||
    state === ProposalState.Active ||
    state === ProposalState.Pending
  ) {
    return true
  }
  return false
}

export type ProposalSucceededStatus = Extract<
  ProposalState,
  ProposalState.Succeeded | ProposalState.Queued
>

export function isProposalSuccessful(
  value: ProposalState
): value is ProposalSucceededStatus {
  return [ProposalState.Succeeded, ProposalState.Queued].includes(value)
}

export const isProposalExecutable = (proposal: {
  state: ProposalState
  executableFrom?: number | null
}) => {
  return (
    proposal.state === ProposalState.Queued &&
    !!proposal.executableFrom &&
    parseBlockchainDate(proposal.executableFrom) < new Date()
  )
}

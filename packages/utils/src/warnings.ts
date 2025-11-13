import { isBlocked } from '@buildeross/blocklist'
import { ProposalState } from '@buildeross/types'

import { isProposalOpen } from './proposalState'
export const checkDrain = (
  totalProposalValue: bigint,
  treasuryBalance: bigint = 0n,
  thresholdPercent: number = 90
): boolean => {
  if (treasuryBalance === 0n) return false // avoid division by zero

  if (!Number.isInteger(thresholdPercent)) return false // avoid invalid percent

  const thresholdAmt = (treasuryBalance * BigInt(thresholdPercent)) / BigInt(100)

  return totalProposalValue >= thresholdAmt
}

export function getProposalWarning(opts: {
  proposer: string
  proposalState: ProposalState
  proposalValues: (string | bigint)[]
  treasuryBalance?: bigint
  daoName?: string
  thresholdPercent?: number // default 90
}): string {
  const {
    proposer,
    proposalValues,
    proposalState,
    treasuryBalance,
    daoName,
    thresholdPercent = 90,
  } = opts

  if (!isProposalOpen(proposalState)) {
    return ''
  }

  const totalProposalValue = proposalValues.reduce(
    (acc: bigint, val: string | bigint) => {
      return acc + BigInt(val)
    },
    0n
  )

  const isBlockedProposer = isBlocked(proposer)

  const warnings: string[] = []

  const isLargeTransfer = checkDrain(
    totalProposalValue,
    treasuryBalance,
    thresholdPercent
  )

  if (isBlockedProposer) {
    warnings.push('The proposer is flagged as a blocked or known malicious actor.')
  }

  if (isLargeTransfer) {
    warnings.push(
      `Executing this proposal will transfer more than ${thresholdPercent}% of${
        daoName ? ` ${daoName}'s` : ' the'
      } treasury.`
    )
  }

  return warnings.join(' ')
}

import type { DashboardDaoWithState } from '@buildeross/hooks/useDashboardData'
import { type AddressType, type CHAIN_ID, ProposalState } from '@buildeross/types'

export type UrgencyLevel = 'warning' | 'critical'

export type UrgencyThresholds = {
  warningSeconds: number
  criticalSeconds: number
}

export const DEFAULT_URGENCY_THRESHOLDS: UrgencyThresholds = {
  warningSeconds: 24 * 60 * 60,
  criticalSeconds: 2 * 60 * 60,
}

type UrgencyAlertBase = {
  id: string
  level: UrgencyLevel
  chainId: CHAIN_ID
  daoId: AddressType
  daoName: string
  daoImage: string
  endTime: number
}

export type AuctionEndingAlert = UrgencyAlertBase & {
  type: 'AUCTION_ENDING'
  tokenId: string
  tokenName: string
}

export type VotingEndingAlert = UrgencyAlertBase & {
  type: 'VOTING_ENDING'
  proposalNumber: number
  proposalTitle: string
  hasVoted: boolean
}

export type ExecutionExpiringAlert = UrgencyAlertBase & {
  type: 'EXECUTION_EXPIRING'
  proposalNumber: number
  proposalTitle: string
}

export type UrgencyAlert = AuctionEndingAlert | VotingEndingAlert | ExecutionExpiringAlert

const getLevel = (
  secondsRemaining: number,
  thresholds: UrgencyThresholds
): UrgencyLevel =>
  secondsRemaining <= thresholds.criticalSeconds ? 'critical' : 'warning'

export const deriveUrgencyAlerts = (
  daos: DashboardDaoWithState[],
  now: number,
  userAddress?: AddressType,
  thresholds: UrgencyThresholds = DEFAULT_URGENCY_THRESHOLDS
): UrgencyAlert[] => {
  const alerts: UrgencyAlert[] = []

  for (const dao of daos) {
    const base = {
      chainId: dao.chainId,
      daoId: dao.tokenAddress as AddressType,
      daoName: dao.name,
      daoImage: dao.contractImage,
    }

    const auctionEnd = Number(dao.currentAuction?.endTime ?? 0)
    if (
      dao.currentAuction &&
      auctionEnd > now &&
      auctionEnd - now <= thresholds.warningSeconds
    ) {
      alerts.push({
        ...base,
        id: `auction:${dao.chainId}:${dao.tokenAddress}:${dao.currentAuction.token.tokenId}`,
        type: 'AUCTION_ENDING',
        level: getLevel(auctionEnd - now, thresholds),
        endTime: auctionEnd,
        tokenId: String(dao.currentAuction.token.tokenId),
        tokenName: dao.currentAuction.token.name,
      })
    }

    for (const proposal of dao.proposals) {
      const proposalTitle = proposal.title || `Proposal #${proposal.proposalNumber}`

      if (proposal.state === ProposalState.Active) {
        const voteEnd = Number(proposal.voteEnd)
        if (voteEnd > now && voteEnd - now <= thresholds.warningSeconds) {
          const hasVoted =
            !!userAddress &&
            proposal.votes.some(
              (vote) => String(vote.voter).toLowerCase() === userAddress.toLowerCase()
            )
          alerts.push({
            ...base,
            id: `vote:${dao.chainId}:${proposal.proposalId}`,
            type: 'VOTING_ENDING',
            level: getLevel(voteEnd - now, thresholds),
            endTime: voteEnd,
            proposalNumber: proposal.proposalNumber,
            proposalTitle,
            hasVoted,
          })
        }
      }

      if (proposal.state === ProposalState.Queued && proposal.expiresAt) {
        const expiresAt = Number(proposal.expiresAt)
        if (expiresAt > now && expiresAt - now <= thresholds.warningSeconds) {
          alerts.push({
            ...base,
            id: `execution:${dao.chainId}:${proposal.proposalId}`,
            type: 'EXECUTION_EXPIRING',
            level: getLevel(expiresAt - now, thresholds),
            endTime: expiresAt,
            proposalNumber: proposal.proposalNumber,
            proposalTitle,
          })
        }
      }
    }
  }

  return alerts.sort((a, b) => a.endTime - b.endTime)
}

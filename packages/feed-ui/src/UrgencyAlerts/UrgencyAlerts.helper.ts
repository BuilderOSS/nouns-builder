import type { DashboardDaoWithState } from '@buildeross/hooks/useDashboardData'
import { type AddressType, type CHAIN_ID, ProposalState } from '@buildeross/types'

export type UrgencyLevel = 'critical' | 'warning' | 'info'

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
  // null for info kinds (no live countdown)
  endTime: number | null
  // always set; used only for ordering within a level
  sortAt: number
}

export type AuctionEndingAlert = UrgencyAlertBase & {
  type: 'AUCTION_ENDING'
  tokenId: string
  tokenName: string
}

export type AuctionNoBidsAlert = UrgencyAlertBase & {
  type: 'AUCTION_NO_BIDS'
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

export type VoteNeededAlert = UrgencyAlertBase & {
  type: 'VOTE_NEEDED'
  proposalNumber: number
  proposalTitle: string
  // seconds until voting ends, for the static "ends in …" microcopy
  voteEndsIn: number
}

export type ProposalExecutableAlert = UrgencyAlertBase & {
  type: 'PROPOSAL_EXECUTABLE'
  proposalNumber: number
  proposalTitle: string
}

export type ProposalQueueableAlert = UrgencyAlertBase & {
  type: 'PROPOSAL_QUEUEABLE'
  proposalNumber: number
  proposalTitle: string
}

export type UrgencyAlert =
  | AuctionEndingAlert
  | AuctionNoBidsAlert
  | VotingEndingAlert
  | ExecutionExpiringAlert
  | VoteNeededAlert
  | ProposalExecutableAlert
  | ProposalQueueableAlert

const LEVEL_RANK: Record<UrgencyLevel, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

const getLevel = (
  secondsRemaining: number,
  thresholds: UrgencyThresholds
): Exclude<UrgencyLevel, 'info'> =>
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
      const hasBid = dao.currentAuction.highestBid != null
      const inCritical = auctionEnd - now <= thresholds.criticalSeconds

      if (!hasBid && inCritical) {
        // #7: no-bids in the final critical window is strictly more
        // informative — suppress the plain AUCTION_ENDING row.
        alerts.push({
          ...base,
          id: `auction-nobids:${dao.chainId}:${dao.tokenAddress}:${dao.currentAuction.token.tokenId}`,
          type: 'AUCTION_NO_BIDS',
          level: 'critical',
          endTime: auctionEnd,
          sortAt: auctionEnd,
          tokenId: String(dao.currentAuction.token.tokenId),
          tokenName: dao.currentAuction.token.name,
        })
      } else {
        alerts.push({
          ...base,
          id: `auction:${dao.chainId}:${dao.tokenAddress}:${dao.currentAuction.token.tokenId}`,
          type: 'AUCTION_ENDING',
          level: getLevel(auctionEnd - now, thresholds),
          endTime: auctionEnd,
          sortAt: auctionEnd,
          tokenId: String(dao.currentAuction.token.tokenId),
          tokenName: dao.currentAuction.token.name,
        })
      }
    }

    for (const proposal of dao.proposals) {
      const proposalTitle = proposal.title || `Proposal #${proposal.proposalNumber}`
      // descending: newer governance items rank higher within the info block
      const infoSortAt = -Number(proposal.timeCreated ?? 0)

      const hasVoted =
        !!userAddress &&
        proposal.votes.some(
          (vote) => String(vote.voter).toLowerCase() === userAddress.toLowerCase()
        )

      if (proposal.state === ProposalState.Active) {
        const voteEnd = Number(proposal.voteEnd)
        if (voteEnd > now) {
          const secondsRemaining = voteEnd - now
          if (secondsRemaining <= thresholds.warningSeconds) {
            // #1 VOTING_ENDING — covers the last-24h window (carries the
            // "You haven't voted" chip for the connected member).
            alerts.push({
              ...base,
              id: `vote:${dao.chainId}:${proposal.proposalId}`,
              type: 'VOTING_ENDING',
              level: getLevel(secondsRemaining, thresholds),
              endTime: voteEnd,
              sortAt: voteEnd,
              proposalNumber: proposal.proposalNumber,
              proposalTitle,
              hasVoted,
            })
          } else if (userAddress && !hasVoted) {
            // #4 VOTE_NEEDED — fires only OUTSIDE the warning window, so a
            // member sees exactly one unvoted surface per proposal at a time.
            alerts.push({
              ...base,
              id: `vote-needed:${dao.chainId}:${proposal.proposalId}`,
              type: 'VOTE_NEEDED',
              level: 'info',
              endTime: null,
              sortAt: infoSortAt,
              proposalNumber: proposal.proposalNumber,
              proposalTitle,
              voteEndsIn: secondsRemaining,
            })
          }
        }
      }

      if (proposal.state === ProposalState.Queued) {
        const expiresAt = proposal.expiresAt ? Number(proposal.expiresAt) : null
        const isExpiringSoon =
          expiresAt != null &&
          expiresAt > now &&
          expiresAt - now <= thresholds.warningSeconds

        if (isExpiringSoon) {
          // #3 EXECUTION_EXPIRING — carries the deadline + higher urgency,
          // so it wins over PROPOSAL_EXECUTABLE for the same proposal.
          alerts.push({
            ...base,
            id: `execution:${dao.chainId}:${proposal.proposalId}`,
            type: 'EXECUTION_EXPIRING',
            level: getLevel(expiresAt - now, thresholds),
            endTime: expiresAt,
            sortAt: expiresAt,
            proposalNumber: proposal.proposalNumber,
            proposalTitle,
          })
        } else if (
          proposal.executableFrom != null &&
          Number(proposal.executableFrom) <= now
        ) {
          // #5 PROPOSAL_EXECUTABLE — fires only when there is no active
          // expiring alert for the proposal (expiring wins).
          alerts.push({
            ...base,
            id: `executable:${dao.chainId}:${proposal.proposalId}`,
            type: 'PROPOSAL_EXECUTABLE',
            level: 'info',
            endTime: null,
            sortAt: infoSortAt,
            proposalNumber: proposal.proposalNumber,
            proposalTitle,
          })
        }
      }

      if (proposal.state === ProposalState.Succeeded) {
        // #6 PROPOSAL_QUEUEABLE — the DAO is stuck waiting on a queue action.
        alerts.push({
          ...base,
          id: `queueable:${dao.chainId}:${proposal.proposalId}`,
          type: 'PROPOSAL_QUEUEABLE',
          level: 'info',
          endTime: null,
          sortAt: infoSortAt,
          proposalNumber: proposal.proposalNumber,
          proposalTitle,
        })
      }
    }
  }

  return alerts.sort((a, b) => {
    if (LEVEL_RANK[a.level] !== LEVEL_RANK[b.level]) {
      return LEVEL_RANK[a.level] - LEVEL_RANK[b.level]
    }
    return a.sortAt - b.sortAt
  })
}

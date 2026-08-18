import { CHAIN_ID } from '@buildeross/types'

import { getProposalState } from '../../contract/requests/getProposalState'
import { SDK } from '../client'
import { Proposal } from './proposalQuery'

export interface ProposalsResponse {
  proposals: Proposal[]
  pageInfo?: {
    hasNextPage: boolean
  }
}

/**
 * Sort proposals with replacement-aware logic.
 * Primary sort: timeCreated descending (newest first)
 * Tie-breaker: For proposals with same timeCreated, newer replacements come before older versions
 *
 * TODO: Once subgraph re-indexes with updatedAt field, replace this client-side sorting
 * with GraphQL orderBy: updatedAt for better performance and simpler logic.
 */
function sortProposalsWithReplacements(proposals: Proposal[]): Proposal[] {
  // Build lookup map for O(1) access
  const proposalMap = new Map<string, Proposal>()
  proposals.forEach((p) => proposalMap.set(p.proposalId.toString(), p))

  // Check if proposalA replaces proposalB (with cycle detection for safety)
  function replacesTransitive(
    aId: string,
    bId: string,
    visited = new Set<string>()
  ): boolean {
    if (visited.has(aId)) return false // Cycle detected
    visited.add(aId)

    const a = proposalMap.get(aId)
    if (!a?.replaces?.proposalId) return false

    const replacedId = a.replaces.proposalId.toString()
    if (replacedId === bId) return true

    return replacesTransitive(replacedId, bId, visited)
  }

  return [...proposals].sort((a, b) => {
    // Primary sort: timeCreated descending
    const aTime = Number(a.timeCreated)
    const bTime = Number(b.timeCreated)
    if (aTime !== bTime) {
      return bTime - aTime
    }

    // Tie-breaker: Check replacement relationships
    const aId = a.proposalId.toString()
    const bId = b.proposalId.toString()

    // Direct replacement check
    if (a.replaces?.proposalId?.toString() === bId) return -1 // a replaces b, so a comes first
    if (b.replaces?.proposalId?.toString() === aId) return 1 // b replaces a, so b comes first

    // Transitive replacement check (for chains A → B → C)
    if (replacesTransitive(aId, bId)) return -1
    if (replacesTransitive(bId, aId)) return 1

    // Fallback: sort by proposalNumber descending
    return b.proposalNumber - a.proposalNumber
  })
}

export const getProposals = async (
  chainId: CHAIN_ID,
  token: string,
  limit: number = 100,
  page?: number
): Promise<ProposalsResponse> => {
  try {
    const data = await SDK.connect(chainId).proposals({
      where: {
        dao: token.toLowerCase(),
      },
      first: limit,
      skip: page ? (page - 1) * limit : 0,
    })

    const allProposals = await Promise.all(
      data?.proposals.map(async (p) => {
        const { executableFrom, expiresAt, calldatas, updatePeriodEnd, ...proposal } = p

        const baseProposal = {
          ...proposal,
          calldatas: calldatas ? calldatas.split(':') : [],
          state: await getProposalState(
            chainId,
            proposal.dao.governorAddress,
            proposal.proposalId
          ),
          ...(updatePeriodEnd ? { updatePeriodEnd: Number(updatePeriodEnd) } : {}),
        }

        // executableFrom and expiresAt will always either be both defined, or neither defined
        if (executableFrom && expiresAt) {
          return {
            ...baseProposal,
            executableFrom,
            expiresAt,
          }
        }
        return baseProposal
      })
    )

    // Show all proposals including replaced versions
    // Sort with replacement-aware logic to handle proposals with same timeCreated
    const sortedProposals = sortProposalsWithReplacements(allProposals)

    return {
      proposals: sortedProposals,
      pageInfo: {
        hasNextPage: data.proposals.reverse()[0].proposalNumber !== 1,
      },
    }
  } catch (e) {
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return {
      proposals: [],
    }
  }
}

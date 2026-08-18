import { CHAIN_ID } from '@buildeross/types'

import { getProposalState, ProposalState } from '../../contract/requests/getProposalState'
import { SDK } from '../client'
import { ProposalFragment } from '../sdk.generated'

export type ProposalVersion = Omit<
  ProposalFragment,
  'calldatas' | 'values' | 'proposer' | 'transactionHash' | 'updatePeriodEnd'
> & {
  proposer: string
  values: string[]
  calldatas: string[]
  transactionHash: string
  updatePeriodEnd?: number
  state: ProposalState
}

/**
 * Sort proposal versions with replacement-aware logic.
 * Primary sort: timeCreated ascending (oldest first for version history)
 * Tie-breaker: For versions with same timeCreated, older versions come before newer replacements
 *
 * TODO: Once subgraph re-indexes with updatedAt field, replace this client-side sorting
 * with GraphQL orderBy: updatedAt for better performance and simpler logic.
 */
function sortProposalVersions(versions: ProposalVersion[]): ProposalVersion[] {
  // Build lookup map for O(1) access
  const versionMap = new Map<string, ProposalVersion>()
  versions.forEach((v) => versionMap.set(v.proposalId.toString(), v))

  // Check if versionA replaces versionB (with cycle detection for safety)
  function replacesTransitive(
    aId: string,
    bId: string,
    visited = new Set<string>()
  ): boolean {
    if (visited.has(aId)) return false // Cycle detected
    visited.add(aId)

    const a = versionMap.get(aId)
    if (!a?.replaces?.proposalId) return false

    const replacedId = a.replaces.proposalId.toString()
    if (replacedId === bId) return true

    return replacesTransitive(replacedId, bId, visited)
  }

  return [...versions].sort((a, b) => {
    // Primary sort: timeCreated ascending (oldest first for version history)
    const aTime = Number(a.timeCreated)
    const bTime = Number(b.timeCreated)
    if (aTime !== bTime) {
      return aTime - bTime
    }

    // Tie-breaker: Check replacement relationships
    const aId = a.proposalId.toString()
    const bId = b.proposalId.toString()

    // Direct replacement check
    if (a.replaces?.proposalId?.toString() === bId) return 1 // a replaces b, so b comes first
    if (b.replaces?.proposalId?.toString() === aId) return -1 // b replaces a, so a comes first

    // Transitive replacement check (for chains A → B → C)
    if (replacesTransitive(aId, bId)) return 1
    if (replacesTransitive(bId, aId)) return -1

    // Fallback: sort by proposalNumber ascending
    return a.proposalNumber - b.proposalNumber
  })
}

export const getProposalVersions = async (
  chainId: CHAIN_ID,
  daoAddress: string,
  proposalNumber: number
): Promise<ProposalVersion[]> => {
  try {
    const data = await SDK.connect(chainId).proposalVersions({
      where: {
        dao: daoAddress.toLowerCase(),
        proposalNumber: proposalNumber,
      },
    })

    const versions = await Promise.all(
      data?.proposals.map(async (p) => {
        const { calldatas, updatePeriodEnd, ...proposal } = p

        // Get state for each version
        const state = await getProposalState(
          chainId,
          proposal.dao.governorAddress,
          proposal.proposalId
        )

        return {
          ...proposal,
          calldatas: calldatas ? calldatas.split(':') : [],
          updatePeriodEnd: updatePeriodEnd ? Number(updatePeriodEnd) : undefined,
          state,
        }
      }) || []
    )

    // Sort versions chronologically with replacement-aware logic
    const sortedVersions = sortProposalVersions(versions)

    return sortedVersions
  } catch (e) {
    console.error('Error fetching proposal versions', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return []
  }
}

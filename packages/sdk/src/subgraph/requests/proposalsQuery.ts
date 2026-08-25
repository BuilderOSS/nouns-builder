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

export const getProposals = async (
  chainId: CHAIN_ID,
  token: string,
  limit: number = 100,
  page?: number
): Promise<ProposalsResponse> => {
  try {
    // Fetch one extra result to determine if there's a next page
    const data = await SDK.connect(chainId).proposals({
      where: {
        dao: token.toLowerCase(),
        replacedBy: null,
      },
      first: limit + 1,
      skip: page ? (page - 1) * limit : 0,
    })

    // Derive hasNextPage from raw result count before enrichment
    const hasNextPage = data.proposals.length > limit
    const proposalsToEnrich = hasNextPage ? data.proposals.slice(0, limit) : data.proposals

    // Enrich only the proposals we're returning (not the extra one used for pagination)
    const proposals = await Promise.all(
      proposalsToEnrich.map(async (p) => {
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

    return {
      proposals,
      pageInfo: {
        hasNextPage,
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

import { supportsUpdatableProposals } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { isProposalReplaced } from '@buildeross/utils/proposalState'

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
    const sdk = SDK.connect(chainId)
    const data = supportsUpdatableProposals(chainId)
      ? await sdk.proposalsUpdatable({
          where: {
            dao: token.toLowerCase(),
          },
          first: limit,
          skip: page ? (page - 1) * limit : 0,
        })
      : await sdk.proposals({
          where: {
            dao: token.toLowerCase(),
          },
          first: limit,
          skip: page ? (page - 1) * limit : 0,
        })

    const allProposals = await Promise.all(
      data?.proposals.map(async (p) => {
        const { executableFrom, expiresAt, calldatas, ...proposal } = p

        const baseProposal: any = {
          ...proposal,
          calldatas: calldatas ? calldatas.split(':') : [],
          state: await getProposalState(
            chainId,
            proposal.dao.governorAddress,
            proposal.proposalId
          ),
        }

        // Add updatable proposal fields (v0.1.17+) with explicit defaults (null, not undefined)
        baseProposal.updatePeriodEnd =
          'updatePeriodEnd' in p && p.updatePeriodEnd ? Number(p.updatePeriodEnd) : null
        baseProposal.updateMessage =
          'updateMessage' in p ? (p.updateMessage ?? null) : null
        baseProposal.updateCount = 'updateCount' in p ? (p.updateCount ?? null) : null
        baseProposal.candidateVersion =
          'candidateVersion' in p ? (p.candidateVersion ?? null) : null
        baseProposal.replaces = 'replaces' in p ? (p.replaces ?? null) : null
        baseProposal.replacedBy = 'replacedBy' in p ? (p.replacedBy ?? null) : null

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

    // Filter out replaced proposals
    const filteredProposals = allProposals.filter(
      (proposal) => !isProposalReplaced(proposal.state)
    )

    return {
      proposals: filteredProposals,
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

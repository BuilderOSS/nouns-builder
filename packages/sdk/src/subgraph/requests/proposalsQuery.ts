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
  page?: number,
): Promise<ProposalsResponse> => {
  try {
    const data = await SDK.connect(chainId).proposals({
      where: {
        dao: token.toLowerCase(),
      },
      first: limit,
      skip: page ? (page - 1) * limit : 0,
    })

    return {
      proposals: await Promise.all(
        data?.proposals.map(async (p) => {
          const { executableFrom, expiresAt, calldatas, ...proposal } = p

          const baseProposal = {
            ...proposal,
            calldatas: calldatas ? calldatas.split(':') : [],
            state: await getProposalState(
              chainId,
              proposal.dao.governorAddress,
              proposal.proposalId,
            ),
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
        }),
      ),
      pageInfo: {
        hasNextPage: data.proposals.reverse()[0].proposalNumber !== 1,
      },
    }
  } catch (e) {
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      await sentry.flush(2000)
    } catch (_) {}
    return {
      proposals: [],
    }
  }
}

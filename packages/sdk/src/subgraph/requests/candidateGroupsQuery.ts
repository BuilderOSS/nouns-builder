import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import {
  CandidateGroupFragmentFragment,
  OrderDirection,
  ProposalCandidateGroup_OrderBy,
} from '../sdk.generated'

export type CandidateGroupSummary = Omit<CandidateGroupFragmentFragment, 'createdAt'> & {
  createdAt: number
}

export interface CandidateGroupsResponse {
  candidateGroups: CandidateGroupSummary[]
  pageInfo?: {
    hasNextPage: boolean
  }
}

export const getCandidateGroups = async (
  chainId: CHAIN_ID,
  token: string,
  limit: number = 100,
  page?: number
): Promise<CandidateGroupsResponse> => {
  try {
    const data = await SDK.connect(chainId).CandidateGroups({
      where: {
        dao: token.toLowerCase(),
      },
      first: limit,
      skip: page ? (page - 1) * limit : 0,
      orderBy: ProposalCandidateGroup_OrderBy.CreatedAt,
      orderDirection: OrderDirection.Desc,
    })

    const candidateGroups = data.proposalCandidateGroups.map((group) => ({
      ...group,
      createdAt: Number(group.createdAt),
    }))

    return {
      candidateGroups,
      pageInfo: {
        hasNextPage: data.proposalCandidateGroups.length === limit,
      },
    }
  } catch (e) {
    console.error('Error fetching candidate groups', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return {
      candidateGroups: [],
      pageInfo: {
        hasNextPage: false,
      },
    }
  }
}

import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import {
  CandidateComment_OrderBy,
  CandidateCommentFragmentFragment,
  OrderDirection,
} from '../sdk.generated'

export type CandidateComment = Omit<CandidateCommentFragmentFragment, 'createdAt'> & {
  createdAt: number
}

export interface CandidateCommentsResponse {
  comments: CandidateComment[]
  pageInfo?: {
    hasNextPage: boolean
  }
}

export const getCandidateComments = async (
  chainId: CHAIN_ID,
  candidateId: string,
  limit: number = 100,
  page?: number
): Promise<CandidateCommentsResponse> => {
  try {
    const data = await SDK.connect(chainId).CandidateComments({
      where: {
        candidate: candidateId.toLowerCase(),
        revoked: false,
      },
      first: limit,
      skip: page ? (page - 1) * limit : 0,
      orderBy: CandidateComment_OrderBy.CreatedAt,
      orderDirection: OrderDirection.Desc,
    })

    const comments = data.candidateComments.map((comment) => ({
      ...comment,
      createdAt: Number(comment.createdAt),
    }))

    return {
      comments,
      pageInfo: {
        hasNextPage: data.candidateComments.length === limit,
      },
    }
  } catch (e) {
    console.error('Error fetching candidate comments', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return {
      comments: [],
      pageInfo: {
        hasNextPage: false,
      },
    }
  }
}

import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import {
  CandidateComment_OrderBy,
  CandidateCommentFragmentFragment,
  OrderDirection,
} from '../sdk.generated'

export type CandidateComment = Omit<
  CandidateCommentFragmentFragment,
  'createdAt' | 'voteWeight' | 'candidateId' | 'proposalHash' | 'commenter'
> & {
  createdAt: number
  voteWeight: bigint
  candidateId: `0x${string}`
  proposalHash: `0x${string}`
  commenter: `0x${string}`
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
        candidateId: candidateId.toLowerCase(),
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
      voteWeight: BigInt(comment.voteWeight),
      candidateId: comment.candidateId as `0x${string}`,
      proposalHash: comment.proposalHash as `0x${string}`,
      commenter: comment.commenter as `0x${string}`,
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

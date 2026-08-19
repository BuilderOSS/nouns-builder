import type { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'
import {
  CandidateComment_OrderBy,
  type CandidateCommentFragmentFragment,
  CandidateVoteSupport,
  OrderDirection,
} from '../sdk.generated'

export type UserCandidateSignal = Omit<
  CandidateCommentFragmentFragment,
  'createdAt' | 'voteWeight' | 'candidateId' | 'proposalHash' | 'commenter'
> & {
  createdAt: number
  voteWeight: bigint
  candidateId: `0x${string}`
  proposalHash: `0x${string}`
  commenter: `0x${string}`
}

/**
 * Check if a user has already signaled on a specific candidate version
 * This is an efficient query that only returns 1 result
 */
export const getUserCandidateSignal = async (
  chainId: CHAIN_ID,
  proposalHash: string,
  userAddress: string
): Promise<UserCandidateSignal | null> => {
  try {
    const response = await SDK.connect(chainId).CandidateComments({
      where: {
        commenter: userAddress.toLowerCase(),
        proposalHash: proposalHash.toLowerCase(),
        revoked: false,
        support_not: CandidateVoteSupport.None, // Only get actual signals, not plain comments
      },
      first: 1, // We only need to know if one exists
      orderBy: CandidateComment_OrderBy.CreatedAt,
      orderDirection: OrderDirection.Desc,
    })

    if (response.candidateComments && response.candidateComments.length > 0) {
      const comment = response.candidateComments[0]
      return {
        ...comment,
        createdAt: Number(comment.createdAt),
        voteWeight: BigInt(comment.voteWeight),
        candidateId: comment.candidateId as `0x${string}`,
        proposalHash: comment.proposalHash as `0x${string}`,
        commenter: comment.commenter as `0x${string}`,
      }
    }

    return null
  } catch (err: unknown) {
    console.error('Error fetching user candidate signal', err)

    try {
      const Sentry = await import('@sentry/nextjs')
      Sentry.captureException(err)
      Sentry.flush(2000).catch(() => {})
    } catch (e) {
      // Sentry not available
    }

    return null
  }
}

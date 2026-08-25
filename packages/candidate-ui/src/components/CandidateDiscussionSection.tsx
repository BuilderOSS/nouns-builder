import { type CandidateComment, type CandidateVersion } from '@buildeross/sdk'
import { CandidateVoteSupport, getCandidateComments } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'
import useSWR from 'swr'

import { CandidateCommentCard } from './CandidateCommentCard'
import { CandidateSigners } from './CandidateSigners'

interface CandidateDiscussionSectionProps {
  candidateProposer: `0x${string}`
  candidateVersion?: CandidateVersion
  tokenSymbol?: string
  governorAddress: `0x${string}`
  onReplyClick?: (comment: CandidateComment) => void
}

const CandidateCommentsPanel = ({
  comments,
  error,
  isLoading,
  onReplyClick,
}: {
  comments: CandidateComment[]
  error?: unknown
  isLoading: boolean
  onReplyClick?: (comment: CandidateComment) => void
}) => {
  const topLevelComments = React.useMemo(
    () =>
      comments
        .filter((comment) => !comment.parentComment?.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [comments]
  )

  const repliesByParentId = React.useMemo(() => {
    const map = new Map<string, CandidateComment[]>()

    for (const comment of comments) {
      const parentId = comment.parentComment?.id
      if (!parentId) continue

      const existing = map.get(parentId) || []
      existing.push(comment)
      map.set(parentId, existing)
    }

    for (const replyList of map.values()) {
      replyList.sort((a, b) => b.createdAt - a.createdAt)
    }

    return map
  }, [comments])

  const latestSignalIds = React.useMemo(() => {
    const latestByUser = new Map<string, CandidateComment>()

    // Find the latest signal for each user
    for (const comment of comments) {
      if (comment.support !== CandidateVoteSupport.None && comment.voteWeight > 0n) {
        const existing = latestByUser.get(comment.commenter)
        if (!existing || comment.createdAt > existing.createdAt) {
          latestByUser.set(comment.commenter, comment)
        }
      }
    }

    // Return Set of IDs for O(1) lookup
    return new Set(Array.from(latestByUser.values()).map((c) => c.id))
  }, [comments])

  const renderThread = React.useCallback(
    (comment: CandidateComment, depth = 0): React.ReactNode => (
      <Stack key={comment.id} gap="x3">
        <CandidateCommentCard
          comment={comment}
          depth={depth}
          isLatestSignalForUser={latestSignalIds.has(comment.id)}
          onReplyClick={onReplyClick}
        />
        {repliesByParentId
          .get(comment.id)
          ?.map((reply) => renderThread(reply, depth + 1))}
      </Stack>
    ),
    [repliesByParentId, latestSignalIds, onReplyClick]
  )

  return (
    <Stack gap={{ '@initial': 'x3', '@768': 'x4' }}>
      <Flex justify="space-between" align="center" wrap gap="x3">
        <Text fontSize={{ '@initial': 18, '@768': 20 }} fontWeight="display">
          Comments
        </Text>
        <Text size="sm" color="text3">
          {comments.length > 0 && !isLoading ? `${comments.length} comments found` : ''}
        </Text>
      </Flex>

      {error && <Text color="negative">Failed to load comments.</Text>}
      {isLoading && comments.length === 0 && (
        <Text color="text3">Loading comments...</Text>
      )}
      {!isLoading && comments.length === 0 && !error && (
        <Text color="text3">No comments yet. Be the first to comment.</Text>
      )}

      {topLevelComments.length > 0 && (
        <Stack gap="x3">{topLevelComments.map((comment) => renderThread(comment))}</Stack>
      )}
    </Stack>
  )
}

export const CandidateDiscussionSection: React.FC<CandidateDiscussionSectionProps> = ({
  candidateProposer,
  candidateVersion,
  tokenSymbol,
  governorAddress,
  onReplyClick,
}) => {
  const { chain } = useChainStore()

  const candidateId = candidateVersion?.candidateId as `0x${string}` | undefined

  const {
    data: candidateComments,
    error: commentsError,
    isLoading: commentsLoading,
  } = useSWR(
    candidateId ? ['candidate-comments', chain.id, candidateId] : null,
    () => getCandidateComments(chain.id, candidateId!, 100),
    { revalidateOnFocus: false }
  )

  const comments = candidateComments?.comments || []

  // Hide action buttons if candidate has been promoted to a proposal
  const isPromoted = !!candidateVersion?.proposal?.id

  return (
    <Stack gap={{ '@initial': 'x4', '@768': 'x6' }}>
      {candidateVersion && tokenSymbol && (
        <CandidateSigners
          candidateId={candidateVersion.candidateId as `0x${string}`}
          proposalHash={candidateVersion.proposalHash as `0x${string}`}
          proposer={candidateProposer as `0x${string}`}
          governorAddress={governorAddress}
          tokenSymbol={String(tokenSymbol)}
          description={candidateVersion.metadata || ''}
          targets={(candidateVersion.targets || []) as string[]}
          values={(candidateVersion.values || []).map((value) => BigInt(value))}
          calldatas={(candidateVersion.calldatas || []) as `0x${string}`[]}
          hideActions={isPromoted}
        />
      )}

      <CandidateCommentsPanel
        comments={comments}
        error={commentsError}
        isLoading={commentsLoading}
        onReplyClick={onReplyClick}
      />
    </Stack>
  )
}

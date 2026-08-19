import { type CandidateComment, type CandidateVersion } from '@buildeross/sdk'
import { CandidateVoteSupport } from '@buildeross/sdk/subgraph'
import { Flex, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'

import { CandidateCommentCard } from './CandidateCommentCard'
import { CandidateSigners } from './CandidateSigners'

interface CandidateDiscussionSectionProps {
  candidateProposer: `0x${string}`
  candidateVersion?: CandidateVersion
  tokenSymbol?: string
  comments: CandidateComment[]
  commentCount: bigint
  commentsLoading: boolean
  commentsError?: unknown
  governorAddress: `0x${string}`
  onReplyClick?: (comment: CandidateComment) => void
  replyingToId?: string
}

const CandidateCommentsPanel = ({
  comments,
  error,
  isLoading,
  replyingTo,
  onReplyClick,
}: {
  comments: CandidateComment[]
  error?: unknown
  isLoading: boolean
  commentCount: bigint
  replyingTo?: CandidateComment
  onReplyClick: (comment: CandidateComment) => void
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
          isReplying={replyingTo?.id === comment.id}
          onReplyClick={onReplyClick}
        />
        {repliesByParentId
          .get(comment.id)
          ?.map((reply) => renderThread(reply, depth + 1))}
      </Stack>
    ),
    [repliesByParentId, latestSignalIds, replyingTo, onReplyClick]
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
  comments,
  commentCount,
  commentsLoading,
  commentsError,
  governorAddress,
  onReplyClick: onReplyClickProp,
  replyingToId,
}) => {
  // Hide action buttons if candidate has been promoted to a proposal
  const isPromoted = !!candidateVersion?.proposal?.id

  // Reply state management (internal state if parent doesn't manage it)
  const [internalReplyingTo, setInternalReplyingTo] = useState<
    CandidateComment | undefined
  >()

  // Use internal state if parent doesn't provide replyingToId
  const effectiveReplyingTo = replyingToId
    ? comments.find((c) => c.id === replyingToId)
    : internalReplyingTo

  const handleReplyClick = useCallback(
    (comment: CandidateComment) => {
      if (onReplyClickProp) {
        // Parent manages the reply state
        onReplyClickProp(comment)
      } else {
        // Use internal state management
        setInternalReplyingTo((current) =>
          current?.id === comment.id ? undefined : comment
        )
      }
    },
    [onReplyClickProp]
  )

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
        commentCount={commentCount}
        replyingTo={effectiveReplyingTo}
        onReplyClick={handleReplyClick}
      />
    </Stack>
  )
}

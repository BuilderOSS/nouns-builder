import { useEnsData } from '@buildeross/hooks'
import {
  type CandidateComment,
  type CandidateGroup,
  type CandidateVersion,
} from '@buildeross/sdk'
import { CandidateVoteSupport } from '@buildeross/sdk/subgraph'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Stack, Text, theme } from '@buildeross/zord'
import React from 'react'

import { CandidateSigners } from './CandidateSigners'

interface CandidateDiscussionSectionProps {
  candidate: CandidateGroup
  latestVersion?: CandidateVersion
  tokenSymbol?: string
  comments: CandidateComment[]
  commentCount: bigint
  commentsLoading: boolean
  commentsError?: unknown
  governorAddress: `0x${string}`
}

const candidateSupportMeta: Record<
  CandidateVoteSupport,
  { label: string; color: string }
> = {
  [CandidateVoteSupport.For]: { label: 'For', color: theme.colors.positive },
  [CandidateVoteSupport.Against]: { label: 'Against', color: theme.colors.negative },
  [CandidateVoteSupport.Abstain]: { label: 'Abstain', color: theme.colors.text4 },
  [CandidateVoteSupport.None]: { label: 'None', color: theme.colors.text4 },
}

const CandidateCommentCard = ({
  comment,
  depth = 0,
}: {
  comment: CandidateComment
  depth?: number
}) => {
  const { ensName, ensAvatar } = useEnsData(comment.commenter as `0x${string}`)
  const support = candidateSupportMeta[comment.support]

  return (
    <Box
      p="x4"
      borderWidth="normal"
      borderColor="border"
      borderStyle="solid"
      borderRadius="curved"
      style={{
        marginLeft: depth > 0 ? 24 : 0,
        background: theme.colors.background1,
        borderLeftWidth: depth > 0 ? 3 : undefined,
        borderLeftColor: depth > 0 ? theme.colors.border : undefined,
      }}
    >
      <Flex justify="space-between" align="center" gap="x3" wrap mb="x2">
        <Flex align="center" gap="x2">
          <Box style={{ minWidth: 0 }}>
            <WalletIdentityWithPreview
              address={comment.commenter as `0x${string}`}
              displayName={ensName || walletSnippet(comment.commenter as `0x${string}`)}
              avatarSrc={ensAvatar}
              avatarSize="28"
              mobileTapBehavior="toggle"
            />
          </Box>
        </Flex>
        <Flex align="center" gap="x2" wrap>
          {support.label !== 'None' && (
            <Box
              style={{
                padding: '4px 8px',
                borderRadius: 999,
                background: support.color,
                color: theme.colors.onAccent,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {support.label}
            </Box>
          )}
          <Text color="text3" fontSize={12}>
            {comment.voteWeight.toString()} signal weight
          </Text>
          <Text color="text3" fontSize={12}>
            {formatTimeAgo(comment.createdAt)}
          </Text>
        </Flex>
      </Flex>

      <Text style={{ whiteSpace: 'pre-wrap' }}>{comment.comment}</Text>
    </Box>
  )
}

const CandidateCommentsPanel = ({
  comments,
  error,
  isLoading,
  commentCount,
}: {
  comments: CandidateComment[]
  error?: unknown
  isLoading: boolean
  commentCount: bigint
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

  const renderThread = React.useCallback(
    (comment: CandidateComment, depth = 0): React.ReactNode => (
      <Stack key={comment.id} gap="x3">
        <CandidateCommentCard comment={comment} depth={depth} />
        {repliesByParentId
          .get(comment.id)
          ?.map((reply) => renderThread(reply, depth + 1))}
      </Stack>
    ),
    [repliesByParentId]
  )

  return (
    <Stack gap="x4">
      <Flex justify="space-between" align="center" wrap gap="x3">
        <Text fontSize={20} fontWeight="display">
          Comments ({commentCount.toString()})
        </Text>
        <Text color="text3" fontSize={14}>
          {comments.length > 0 ? `${comments.length} loaded` : 'Loading discussion'}
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
  candidate,
  latestVersion,
  tokenSymbol,
  comments,
  commentCount,
  commentsLoading,
  commentsError,
  governorAddress,
}) => {
  return (
    <Stack gap="x6">
      {latestVersion && tokenSymbol && (
        <Box>
          <Box fontSize={20} mb={{ '@initial': 'x4', '@768': 'x5' }} fontWeight="display">
            Sponsors
          </Box>
          <CandidateSigners
            candidateVersionUID={latestVersion.id as `0x${string}`}
            proposer={candidate.proposer as `0x${string}`}
            governorAddress={governorAddress}
            tokenSymbol={String(tokenSymbol)}
            description={latestVersion.metadata || ''}
            targets={(latestVersion.targets || []) as string[]}
            values={(latestVersion.values || []).map((value) => BigInt(value))}
            calldatas={(latestVersion.calldatas || []) as `0x${string}`[]}
            signatureCount={latestVersion.signatureCount}
          />
        </Box>
      )}

      <Box>
        <Box fontSize={20} mb={{ '@initial': 'x4', '@768': 'x5' }} fontWeight="display">
          Comments
        </Box>
        <CandidateCommentsPanel
          comments={comments}
          error={commentsError}
          isLoading={commentsLoading}
          commentCount={commentCount}
        />
      </Box>
    </Stack>
  )
}

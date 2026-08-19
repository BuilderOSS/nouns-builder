import { useEnsData } from '@buildeross/hooks'
import { type CandidateComment } from '@buildeross/sdk'
import { CandidateVoteSupport } from '@buildeross/sdk/subgraph'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Text, theme } from '@buildeross/zord'
import React from 'react'

const candidateSupportMeta: Record<
  CandidateVoteSupport,
  { label: string; color: string }
> = {
  [CandidateVoteSupport.For]: { label: 'For', color: theme.colors.positive },
  [CandidateVoteSupport.Against]: { label: 'Against', color: theme.colors.negative },
  [CandidateVoteSupport.Abstain]: { label: 'Abstain', color: theme.colors.text4 },
  [CandidateVoteSupport.None]: { label: 'None', color: theme.colors.text4 },
}

interface CandidateCommentCardProps {
  comment: CandidateComment
  depth?: number
  isLatestSignalForUser?: boolean
  onReplyClick?: (comment: CandidateComment) => void
}

export const CandidateCommentCard: React.FC<CandidateCommentCardProps> = ({
  comment,
  depth = 0,
  isLatestSignalForUser = true,
  onReplyClick,
}) => {
  const { ensName, ensAvatar } = useEnsData(comment.commenter as `0x${string}`)
  const support = candidateSupportMeta[comment.support]

  return (
    <Box
      p={{ '@initial': 'x3', '@768': 'x4' }}
      borderWidth="normal"
      borderColor="border"
      borderStyle="solid"
      borderRadius="curved"
      style={{
        marginLeft: depth > 0 ? 16 : 0,
        background: theme.colors.background1,
        borderLeftWidth: depth > 0 ? 3 : undefined,
        borderLeftColor: depth > 0 ? theme.colors.border : undefined,
      }}
    >
      <Flex
        justify="space-between"
        align={{ '@initial': 'flex-start', '@768': 'center' }}
        direction={{ '@initial': 'column', '@768': 'row' }}
        gap={{ '@initial': 'x2', '@768': 'x3' }}
        wrap
        mb="x2"
      >
        <Flex align="center" gap="x2">
          <Box style={{ minWidth: 0 }}>
            <WalletIdentityWithPreview
              address={comment.commenter as `0x${string}`}
              displayName={ensName || walletSnippet(comment.commenter as `0x${string}`)}
              avatarSrc={ensAvatar}
              avatarSize="24"
              mobileTapBehavior="toggle"
            />
          </Box>
        </Flex>
        <Flex align="center" gap="x2" wrap>
          {support.label !== 'None' &&
            comment.voteWeight > 0n &&
            isLatestSignalForUser && (
              <>
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
                <Text color="text3" fontSize={12}>
                  {comment.voteWeight.toString()} signal weight
                </Text>
              </>
            )}
          <Text color="text3" fontSize={12}>
            {formatTimeAgo(comment.createdAt)}
          </Text>
        </Flex>
      </Flex>

      {/* Only show comment text if it's not empty, otherwise show "Signaled without comment" for signal-only posts */}
      {comment.comment.trim().length > 0 ? (
        <Text style={{ whiteSpace: 'pre-wrap' }} mb={onReplyClick ? 'x3' : undefined}>
          {comment.comment}
        </Text>
      ) : (
        support.label !== 'None' &&
        comment.voteWeight > 0n &&
        isLatestSignalForUser && (
          <Text
            color="text3"
            fontSize={14}
            style={{ fontStyle: 'italic' }}
            mb={onReplyClick ? 'x3' : undefined}
          >
            Signaled without comment
          </Text>
        )
      )}

      {onReplyClick && (
        <Flex justify="flex-end">
          <Button variant="outline" size="sm" onClick={() => onReplyClick(comment)}>
            Reply
          </Button>
        </Flex>
      )}
    </Box>
  )
}

import { useEnsData, useZoraCoinComments } from '@buildeross/hooks'
import { Avatar } from '@buildeross/ui/Avatar'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'
import { Address } from 'viem'

import { CoinCommentForm } from './CoinCommentForm'
import {
  commentAuthor,
  commentCard,
  commentContent,
  commentHeader,
  commentsContainer,
  commentsTitle,
  loadMoreButton,
} from './CoinComments.css'

interface CoinCommentsProps {
  coinAddress: Address
  chainId: number
}

const CommentCard: React.FC<{
  comment: string
  timestamp: number
  userAddress: string
  userProfile?: {
    handle: string
    avatar?: {
      previewImage: {
        small: string
        medium: string
      }
    }
  }
}> = ({ comment, timestamp, userAddress, userProfile }) => {
  const { displayName, ensAvatar } = useEnsData(userAddress as Address)
  const { getProfileLink } = useLinks()

  const timeAgo = formatTimeAgo(timestamp)
  const author =
    userProfile?.handle || displayName || walletSnippet(userAddress as Address)
  // Prefer Zora avatar, fallback to ENS avatar
  const avatarSrc = userProfile?.avatar?.previewImage?.small || ensAvatar

  return (
    <Box className={commentCard}>
      <Flex className={commentHeader} align="center" justify="space-between">
        <Link link={getProfileLink(userAddress as Address)}>
          <Flex align="center" gap="x1" className={commentAuthor}>
            <Avatar address={userAddress as Address} src={avatarSrc} size="20" />
            <Text fontWeight="display" fontSize="16">
              {author}
            </Text>
          </Flex>
        </Link>
        <Text variant="label-sm" color="text4">
          {timeAgo}
        </Text>
      </Flex>
      <Text className={commentContent} variant="paragraph-md">
        {comment}
      </Text>
    </Box>
  )
}

export const CoinComments: React.FC<CoinCommentsProps> = ({ coinAddress, chainId }) => {
  const { comments, isLoading, error, hasMore, loadMore, refetch } = useZoraCoinComments({
    coinAddress,
    chainId,
    enabled: true,
    count: 20,
  })

  // Flatten comments and replies into a single chronological list
  const flattenedComments = useMemo(() => {
    const allComments: Array<{
      commentId: string
      comment: string
      timestamp: number
      userAddress: string
      userProfile?: {
        handle: string
        avatar?: {
          previewImage: {
            small: string
            medium: string
          }
        }
      }
    }> = []

    // Add all top-level comments and their replies
    comments.forEach((comment) => {
      // Add the main comment
      allComments.push({
        commentId: comment.commentId,
        comment: comment.comment,
        timestamp: comment.timestamp,
        userAddress: comment.userAddress,
        userProfile: comment.userProfile,
      })

      // Add all replies
      comment.replies.forEach((reply) => {
        allComments.push({
          commentId: reply.commentId,
          comment: reply.comment,
          timestamp: reply.timestamp,
          userAddress: reply.userAddress,
          userProfile: reply.userProfile,
        })
      })
    })

    // Sort by timestamp descending (latest first)
    return allComments.sort((a, b) => b.timestamp - a.timestamp)
  }, [comments])

  if (error) {
    return (
      <Box className={commentsContainer}>
        <Text variant="label-sm" color="text3" className={commentsTitle}>
          Comments
        </Text>
        <Text variant="paragraph-sm" color="negative">
          Failed to load comments
        </Text>
      </Box>
    )
  }

  return (
    <Box className={commentsContainer}>
      <Text variant="label-sm" color="text3" className={commentsTitle} mb="x4">
        Comments ({flattenedComments.length})
      </Text>

      {/* Comment Form */}
      <CoinCommentForm
        coinAddress={coinAddress}
        chainId={chainId}
        onCommentPosted={refetch}
      />

      {/* Loading state (only when no comments loaded yet) */}
      {isLoading && flattenedComments.length === 0 && (
        <Text variant="paragraph-sm" color="text3">
          Loading comments...
        </Text>
      )}

      {/* Empty state */}
      {!isLoading && flattenedComments.length === 0 && (
        <Text variant="paragraph-sm" color="text3">
          No comments yet. Be the first to comment!
        </Text>
      )}

      {/* Comments list */}
      {flattenedComments.length > 0 && (
        <>
          <Flex direction="column" gap="x2">
            {flattenedComments.map((comment) => (
              <CommentCard
                key={comment.commentId}
                comment={comment.comment}
                timestamp={comment.timestamp}
                userAddress={comment.userAddress}
                userProfile={comment.userProfile}
              />
            ))}
          </Flex>

          {/* Load more button */}
          {hasMore && (
            <Button
              variant="secondary"
              className={loadMoreButton}
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </Button>
          )}
        </>
      )}
    </Box>
  )
}

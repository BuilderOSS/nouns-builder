import { type CoinCommentReply, useEnsData, useZoraCoinComments } from '@buildeross/hooks'
import { Avatar } from '@buildeross/ui/Avatar'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import React from 'react'
import { Address } from 'viem'

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

const ReplyCard: React.FC<CoinCommentReply> = ({
  comment,
  timestamp,
  userAddress,
  userProfile,
}) => {
  const { displayName, ensAvatar } = useEnsData(userAddress as Address)
  const { getProfileLink } = useLinks()

  const timeAgo = formatTimeAgo(timestamp)
  const author =
    userProfile?.handle || displayName || walletSnippet(userAddress as Address)
  const avatarSrc = userProfile?.avatar?.previewImage?.small || ensAvatar

  return (
    <Flex gap="x3" align="flex-start">
      <Link link={getProfileLink(userAddress as Address)}>
        <Avatar address={userAddress as Address} src={avatarSrc} size="24" />
      </Link>
      <Box flex={1}>
        <Flex align="center" gap="x2" mb="x1">
          <Link link={getProfileLink(userAddress as Address)}>
            <Text fontWeight="display" className={commentAuthor}>
              {author}
            </Text>
          </Link>
          <Text variant="label-sm" color="text4">
            {timeAgo}
          </Text>
        </Flex>
        <Text variant="paragraph-sm" color="text1">
          {comment}
        </Text>
      </Box>
    </Flex>
  )
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
  replies: CoinCommentReply[]
}> = ({ comment, timestamp, userAddress, userProfile, replies }) => {
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
          <Flex align="center" gap="x2" className={commentAuthor}>
            <Avatar address={userAddress as Address} src={avatarSrc} size="32" />
            <Text fontWeight="display">{author}</Text>
          </Flex>
        </Link>
        <Text variant="label-sm" color="text4">
          {timeAgo}
        </Text>
      </Flex>
      <Text className={commentContent} variant="paragraph-md">
        {comment}
      </Text>

      {/* Replies */}
      {replies.length > 0 && (
        <Box mt="x4" pl="x6" borderLeft="2px solid" borderColor="border">
          <Flex direction="column" gap="x3">
            {replies.map((reply) => (
              <ReplyCard key={reply.commentId} {...reply} />
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  )
}

export const CoinComments: React.FC<CoinCommentsProps> = ({ coinAddress, chainId }) => {
  const { comments, isLoading, error, hasMore, loadMore } = useZoraCoinComments({
    coinAddress,
    chainId,
    enabled: true,
    count: 20,
  })

  if (error) {
    return (
      <Box className={commentsContainer}>
        <Text variant="heading-sm" className={commentsTitle}>
          Comments
        </Text>
        <Text variant="paragraph-sm" color="negative">
          Failed to load comments
        </Text>
      </Box>
    )
  }

  if (isLoading && comments.length === 0) {
    return (
      <Box className={commentsContainer}>
        <Text variant="heading-sm" className={commentsTitle}>
          Comments
        </Text>
        <Text variant="paragraph-sm" color="text3">
          Loading comments...
        </Text>
      </Box>
    )
  }

  if (comments.length === 0) {
    return (
      <Box className={commentsContainer}>
        <Text variant="heading-sm" className={commentsTitle}>
          Comments
        </Text>
        <Text variant="paragraph-sm" color="text3">
          No comments yet. Be the first to comment!
        </Text>
      </Box>
    )
  }

  return (
    <Box className={commentsContainer}>
      <Text variant="heading-sm" className={commentsTitle} mb="x4">
        Comments ({comments.length})
      </Text>
      <Flex direction="column" gap="x3">
        {comments.map((comment) => (
          <CommentCard
            key={comment.commentId}
            comment={comment.comment}
            timestamp={comment.timestamp}
            userAddress={comment.userAddress}
            userProfile={comment.userProfile}
            replies={comment.replies}
          />
        ))}
      </Flex>
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
    </Box>
  )
}

import { getCoinComments } from '@zoralabs/coins-sdk'
import { useEffect, useState } from 'react'
import { Address } from 'viem'

export interface CoinCommentReply {
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
}

export interface CoinComment {
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
  replies: CoinCommentReply[]
}

interface UseZoraCoinCommentsParams {
  coinAddress: Address | null
  chainId: number
  enabled?: boolean
  count?: number
}

interface UseZoraCoinCommentsResult {
  comments: CoinComment[]
  isLoading: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => void
}

export const useZoraCoinComments = ({
  coinAddress,
  chainId,
  enabled = true,
  count = 20,
}: UseZoraCoinCommentsParams): UseZoraCoinCommentsResult => {
  const [comments, setComments] = useState<CoinComment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    // Reset state when coin address changes
    setComments([])
    setCursor(null)
    setHasMore(true)
    setError(null)
  }, [coinAddress])

  useEffect(() => {
    if (!enabled || !coinAddress) {
      setComments([])
      setIsLoading(false)
      setError(null)
      return
    }

    const fetchComments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getCoinComments({
          address: coinAddress,
          chain: chainId,
          count,
        })

        const edges = response.data?.zora20Token?.zoraComments?.edges || []
        const newComments: CoinComment[] = edges.map((edge) => ({
          commentId: edge.node.commentId,
          comment: edge.node.comment,
          timestamp: edge.node.timestamp,
          userAddress: edge.node.userAddress,
          userProfile: edge.node.userProfile
            ? {
                handle: edge.node.userProfile.handle,
                avatar: edge.node.userProfile.avatar
                  ? {
                      previewImage: {
                        small: edge.node.userProfile.avatar.previewImage.small,
                        medium: edge.node.userProfile.avatar.previewImage.medium,
                      },
                    }
                  : undefined,
              }
            : undefined,
          replies:
            edge.node.replies?.edges?.map((replyEdge) => ({
              commentId: replyEdge.node.commentId,
              comment: replyEdge.node.comment,
              timestamp: replyEdge.node.timestamp,
              userAddress: replyEdge.node.userAddress,
              userProfile: replyEdge.node.userProfile
                ? {
                    handle: replyEdge.node.userProfile.handle,
                    avatar: replyEdge.node.userProfile.avatar
                      ? {
                          previewImage: {
                            small: replyEdge.node.userProfile.avatar.previewImage.small,
                            medium: replyEdge.node.userProfile.avatar.previewImage.medium,
                          },
                        }
                      : undefined,
                  }
                : undefined,
            })) || [],
        }))

        setComments(newComments)
        setCursor(response.data?.zora20Token?.zoraComments?.pageInfo?.endCursor || null)
        setHasMore(
          response.data?.zora20Token?.zoraComments?.pageInfo?.hasNextPage || false
        )
      } catch (err) {
        console.error('Error fetching Zora coin comments:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch comments'))
        setComments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [coinAddress, chainId, enabled, count])

  const loadMore = async () => {
    if (!enabled || !coinAddress || !hasMore || !cursor || isLoading) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getCoinComments({
        address: coinAddress,
        chain: chainId,
        after: cursor,
        count,
      })

      const edges = response.data?.zora20Token?.zoraComments?.edges || []
      const newComments: CoinComment[] = edges.map((edge) => ({
        commentId: edge.node.commentId,
        comment: edge.node.comment,
        timestamp: edge.node.timestamp,
        userAddress: edge.node.userAddress,
        userProfile: edge.node.userProfile
          ? {
              handle: edge.node.userProfile.handle,
              avatar: edge.node.userProfile.avatar
                ? {
                    previewImage: {
                      small: edge.node.userProfile.avatar.previewImage.small,
                      medium: edge.node.userProfile.avatar.previewImage.medium,
                    },
                  }
                : undefined,
            }
          : undefined,
        replies:
          edge.node.replies?.edges?.map((replyEdge) => ({
            commentId: replyEdge.node.commentId,
            comment: replyEdge.node.comment,
            timestamp: replyEdge.node.timestamp,
            userAddress: replyEdge.node.userAddress,
            userProfile: replyEdge.node.userProfile
              ? {
                  handle: replyEdge.node.userProfile.handle,
                  avatar: replyEdge.node.userProfile.avatar
                    ? {
                        previewImage: {
                          small: replyEdge.node.userProfile.avatar.previewImage.small,
                          medium: replyEdge.node.userProfile.avatar.previewImage.medium,
                        },
                      }
                    : undefined,
                }
              : undefined,
          })) || [],
      }))

      setComments((prev) => [...prev, ...newComments])
      setCursor(response.data?.zora20Token?.zoraComments?.pageInfo?.endCursor || null)
      setHasMore(response.data?.zora20Token?.zoraComments?.pageInfo?.hasNextPage || false)
    } catch (err) {
      console.error('Error loading more comments:', err)
      setError(err instanceof Error ? err : new Error('Failed to load more comments'))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    comments,
    isLoading,
    error,
    hasMore,
    loadMore,
  }
}

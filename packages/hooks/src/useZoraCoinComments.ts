import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getCoinComments } from '@zoralabs/coins-sdk'
import { useCallback, useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'
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
  refetch: () => void
}

interface CommentsPageData {
  comments: CoinComment[]
  endCursor: string | null
  hasNextPage: boolean
}

// Helper to transform API response to our format
const transformCommentsResponse = (response: any): CoinComment[] => {
  const edges = response.data?.zora20Token?.zoraComments?.edges || []
  return edges.map((edge: any) => ({
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
      edge.node.replies?.edges?.map((replyEdge: any) => ({
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
}

// Fetcher function for SWR
const fetcher = async ([_key, coinAddress, chainId, count, cursor]: readonly [
  string,
  Address,
  number,
  number,
  string | null,
]): Promise<CommentsPageData> => {
  const response = await getCoinComments({
    address: coinAddress,
    chain: chainId,
    count,
    ...(cursor && { after: cursor }),
  })

  const comments = transformCommentsResponse(response)
  const pageInfo = response.data?.zora20Token?.zoraComments?.pageInfo

  return {
    comments,
    endCursor: pageInfo?.endCursor || null,
    hasNextPage: pageInfo?.hasNextPage || false,
  }
}

export const useZoraCoinComments = ({
  coinAddress,
  chainId,
  enabled = true,
  count = 20,
}: UseZoraCoinCommentsParams): UseZoraCoinCommentsResult => {
  // Build base key for SWR
  const baseKey = useMemo(() => {
    if (!enabled || !coinAddress) return null
    return {
      coinAddress,
      chainId,
      count,
    }
  }, [enabled, coinAddress, chainId, count])

  const { data, error, isValidating, size, setSize, mutate } = useSWRInfinite<
    CommentsPageData,
    Error
  >(
    (pageIndex, previousPageData) => {
      if (!baseKey) return null
      if (previousPageData && !previousPageData.hasNextPage) return null

      const cursor = pageIndex === 0 ? null : (previousPageData?.endCursor ?? null)
      return [SWR_KEYS.ZORA_COIN_COMMENTS, coinAddress!, chainId, count, cursor] as const
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 15_000,
      keepPreviousData: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: (err) => {
        console.error('Error fetching Zora coin comments:', err)
      },
    }
  )

  // Flatten paginated comments with deduplication
  const comments = useMemo(() => {
    if (!data) return []
    const seen = new Set<string>()
    return data
      .flatMap((page) => page.comments)
      .filter((comment) => {
        if (seen.has(comment.commentId)) return false
        seen.add(comment.commentId)
        return true
      })
  }, [data])

  const hasMore = useMemo(() => {
    const lastPage = data?.[data.length - 1]
    return lastPage?.hasNextPage ?? false
  }, [data])

  const isLoading = useMemo(() => !data && !error && enabled, [data, error, enabled])

  const loadMore = useCallback(() => {
    if (hasMore && !isValidating) {
      setSize(size + 1)
    }
  }, [hasMore, isValidating, setSize, size])

  return {
    comments,
    isLoading,
    error: error || null,
    hasMore,
    loadMore,
    refetch: mutate,
  }
}

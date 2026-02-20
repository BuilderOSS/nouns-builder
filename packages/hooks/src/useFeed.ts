import { FeedEventType } from '@buildeross/sdk/subgraph'
import {
  type CHAIN_ID,
  type FeedItem,
  type FeedItemType,
  FeedItemTypes,
  type FeedResponse,
} from '@buildeross/types'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import { useCallback, useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'

type UseFeedOptions = {
  chainIds?: CHAIN_ID[]
  daos?: string[]
  eventTypes?: FeedEventType[]
  actor?: string
  limit?: number
  enabled?: boolean
  onError?: (error: HttpError) => void
}

type UseFeedReturn = {
  items: FeedItem[]
  hasMore: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isValidating: boolean
  error: Error | undefined
  refresh: () => Promise<void>
  fetchNextPage: () => Promise<void>
}

const COIN_FEED_ITEM_TYPES = [
  FeedItemTypes.CLANKER_TOKEN_CREATED,
  FeedItemTypes.ZORA_COIN_CREATED,
] as FeedItemType[]

/**
 * Build feed query URL
 */
function buildFeedUrl({
  chainIds,
  daos,
  eventTypes,
  actor,
  limit,
  cursor,
}: {
  chainIds?: CHAIN_ID[]
  daos?: string[]
  eventTypes?: FeedEventType[]
  actor?: string
  limit?: number
  cursor?: number | null
}) {
  const params = new URLSearchParams()
  if (chainIds && chainIds.length > 0) {
    params.append('chainIds', chainIds.join(','))
  }
  if (daos && daos.length > 0) params.append('daos', daos.join(','))
  if (eventTypes && eventTypes.length > 0)
    params.append('eventTypes', eventTypes.join(','))
  if (actor) params.append('actor', actor)
  if (limit) params.append('limit', String(limit))
  if (cursor) params.append('cursor', String(cursor))
  return `/api/feed?${params.toString()}`
}

type HttpError = Error & { status?: number; body?: unknown }

const fetcher = async (
  url: string,
  { signal }: { signal?: AbortSignal } = {}
): Promise<FeedResponse> => {
  const res = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  })

  const text = await res.text()
  const body = text ? JSON.parse(text) : {}
  if (!res.ok) {
    const err: HttpError = new Error(body?.error || res.statusText)
    err.status = res.status
    err.body = body
    throw err
  }
  return body as FeedResponse
}

/**
 * Hook for infinite scroll feed with automatic deduplication
 *
 * @example
 * const { items, hasMore, isLoading, fetchNextPage } = useFeed({
 *   chainIds: [1],
 *   limit: 20,
 * })
 *
 * @example
 * // Filter by multiple DAOs
 * const { items, hasMore, isLoading, fetchNextPage } = useFeed({
 *   chainIds: [1],
 *   daos: ['0x123...', '0x456...'],
 *   limit: 20,
 * })
 *
 * @example
 * // Filter by event types
 * const { items, hasMore, isLoading, fetchNextPage } = useFeed({
 *   chainIds: [1],
 *   eventTypes: [FeedEventType.AuctionBidPlaced, FeedEventType.ProposalCreated],
 *   limit: 20,
 * })
 */
export function useFeed({
  chainIds,
  daos,
  eventTypes,
  actor,
  limit = 20,
  enabled = true,
  onError,
}: UseFeedOptions): UseFeedReturn {
  const baseKey = useMemo(() => {
    if (!enabled) return null
    // Stringify arrays for proper memoization
    return {
      chainIds: chainIds?.join(','),
      daos: daos?.join(','),
      eventTypes: eventTypes?.join(','),
      actor,
      limit,
    }
  }, [enabled, chainIds, daos, eventTypes, actor, limit])

  const { data, error, isValidating, size, setSize, mutate } = useSWRInfinite<
    FeedResponse,
    HttpError
  >(
    (pageIndex, previousPageData) => {
      if (!baseKey) return null
      if (previousPageData && !previousPageData.hasMore) return null

      const cursor = pageIndex === 0 ? null : (previousPageData?.nextCursor ?? null)
      return buildFeedUrl({
        chainIds,
        daos,
        eventTypes,
        actor,
        limit,
        cursor,
      })
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 15_000,
      keepPreviousData: true,

      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: (err) => {
        console.error('Feed fetch error:', err)
        onError?.(err)
      },
    }
  )

  // flatten paginated items && remove unsupported items
  const items = useMemo(() => {
    if (!data) return []
    const seen = new Set<string>()
    // NOTE: backend might return duplicate items on page boundaries
    return data
      .flatMap((page) => page.items)
      .filter((item) => {
        if (seen.has(item.id)) return false
        if (
          COIN_FEED_ITEM_TYPES.includes(item.type) &&
          !isChainIdSupportedByCoining(item.chainId)
        )
          return false
        seen.add(item.id)
        return true
      })
  }, [data])
  const hasMore: boolean = useMemo(() => {
    const lastPage = data?.[data.length - 1]
    return lastPage?.hasMore ?? false
  }, [data])
  const isLoading = useMemo(() => !data && !error && enabled, [data, error, enabled])
  const isLoadingMore: boolean = useMemo(
    () => !!(isValidating && size > 0 && data && size > data.length),
    [isValidating, data, size]
  )

  const fetchNextPage = useCallback(async () => {
    if (hasMore && !isLoadingMore) {
      await setSize(size + 1)
    }
  }, [hasMore, isLoadingMore, setSize, size])

  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  return {
    items,
    hasMore,
    isLoading,
    isLoadingMore,
    isValidating,
    error,
    fetchNextPage,
    refresh,
  }
}

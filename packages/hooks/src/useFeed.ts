import type { CHAIN_ID, FeedItem, FeedResponse } from '@buildeross/types'
import { useCallback, useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'

type UseFeedOptions = {
  chainId?: CHAIN_ID
  daoAddress?: string
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

/**
 * Build feed query URL
 */
function buildFeedUrl({
  chainId,
  daoAddress,
  actor,
  limit,
  cursor,
}: {
  chainId?: CHAIN_ID
  daoAddress?: string
  actor?: string
  limit?: number
  cursor?: number | null
}) {
  const params = new URLSearchParams()
  if (chainId) params.append('chainId', String(chainId))
  if (daoAddress) params.append('daoAddress', daoAddress)
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
 *   chainId: 1,
 *   limit: 20,
 * })
 */
export function useFeed({
  chainId,
  daoAddress,
  actor,
  limit = 20,
  enabled = true,
  onError,
}: UseFeedOptions): UseFeedReturn {
  const baseKey = useMemo(() => {
    if (!enabled) return null
    return { chainId, daoAddress, actor, limit }
  }, [enabled, chainId, daoAddress, actor, limit])

  const { data, error, isValidating, size, setSize, mutate } = useSWRInfinite<
    FeedResponse,
    HttpError
  >(
    (pageIndex, previousPageData) => {
      if (!baseKey) return null
      if (previousPageData && !previousPageData.hasMore) return null

      const cursor = pageIndex === 0 ? null : (previousPageData?.nextCursor ?? null)
      return buildFeedUrl({
        ...baseKey,
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

  // flatten paginated items
  const items = useMemo(() => {
    if (!data) return []
    const seen = new Set<string>()
    // NOTE: backend might return duplicate items on page boundaries
    return data
      .flatMap((page) => page.items)
      .filter((item) => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })
  }, [data])
  const hasMore = useMemo(() => data?.[data.length - 1]?.hasMore ?? false, [data])
  const isLoading = useMemo(() => !data && !error && enabled, [data, error, enabled])
  const isLoadingMore = useMemo(
    () => (isValidating && data && data.length < size ? true : false),
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

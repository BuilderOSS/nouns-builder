import type { CHAIN_ID, FeedItem, FeedResponse } from '@buildeross/types'
import { useCallback, useMemo } from 'react'
import useSWR from 'swr'

type UseFeedOptions = {
  chainId?: CHAIN_ID
  daoAddress?: string
  actor?: string
  limit?: number
  cursor?: number | null
  enabled?: boolean
}

type UseFeedReturn = {
  items: FeedItem[]
  hasMore: boolean
  nextCursor: number | null
  isLoading: boolean
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
  if (res.status === 304) return { items: [], hasMore: false, nextCursor: null }
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
 * useFeed hook — handles feed fetching, pagination, and caching
 */
export function useFeed({
  chainId,
  daoAddress,
  actor,
  limit = 20,
  cursor = null,
  enabled = true,
}: UseFeedOptions): UseFeedReturn {
  const key = useMemo(() => {
    if (!enabled) return null
    return buildFeedUrl({ chainId, daoAddress, actor, limit, cursor })
  }, [enabled, chainId, daoAddress, actor, limit, cursor])

  const { data, error, isValidating, mutate } = useSWR<FeedResponse, HttpError>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 15_000, // 15s deduping
      keepPreviousData: true,
    }
  )

  const items = data?.items ?? []
  const hasMore = data?.hasMore ?? false
  const nextCursor = data?.nextCursor ?? null
  const isLoading = !data && !error && enabled

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || !nextCursor) return
    const nextUrl = buildFeedUrl({
      chainId,
      daoAddress,
      actor,
      limit,
      cursor: nextCursor,
    })

    const nextData = await fetcher(nextUrl)
    if (!nextData?.items?.length) return

    // Merge with current cache
    mutate((current) => {
      const finalItems = [...(current?.items || []), ...nextData.items]
      if (nextData.hasMore) {
        // If we have more items, we need to merge them with the current cache
        return {
          items: finalItems,
          hasMore: true,
          nextCursor: nextData.nextCursor,
        }
      }

      return {
        items: finalItems,
        hasMore: false,
        nextCursor: null,
      }
    })
  }, [hasMore, nextCursor, chainId, daoAddress, actor, limit, mutate])

  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  return {
    items,
    hasMore,
    nextCursor,
    isLoading,
    isValidating,
    error,
    fetchNextPage,
    refresh,
  }
}

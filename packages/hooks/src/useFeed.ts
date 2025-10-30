import type { CHAIN_ID, FeedItem, FeedResponse } from '@buildeross/types'
import { useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'

type UseFeedOptions = {
  chainId?: CHAIN_ID
  daoAddress?: string
  actor?: string
  limit?: number
  enabled?: boolean
}

type UseFeedReturn = {
  items: FeedItem[]
  hasMore: boolean
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
 * useFeedInfinite — automatic infinite scroll pagination via useSWRInfinite
 */
export function useFeed({
  chainId,
  daoAddress,
  actor,
  limit = 20,
  enabled = true,
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
    }
  )

  // flatten paginated items
  const items = data ? data.flatMap((page) => page.items) : []
  const hasMore = data?.[data.length - 1]?.hasMore ?? false
  const isLoading = !data && !error && enabled

  const fetchNextPage = async () => {
    if (hasMore) await setSize(size + 1)
  }

  const refresh = async () => {
    await mutate()
  }

  return {
    items,
    hasMore,
    isLoading,
    isValidating,
    error,
    fetchNextPage,
    refresh,
  }
}

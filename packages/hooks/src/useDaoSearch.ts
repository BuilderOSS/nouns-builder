import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { type ExploreDaoWithChainId } from '@buildeross/sdk/subgraph'
import { buildSearchText } from '@buildeross/utils/search'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

export interface DaoSearchResult {
  daos: ExploreDaoWithChainId[]
  error?: HttpError
  isLoading: boolean
  isEmpty: boolean
  hasNextPage?: boolean
}

interface UseDaoSearchOptions {
  debounceMs?: number
  enabled?: boolean
  page?: string
}

const DEFAULT_DEBOUNCE_MS = 300

// Fetcher function defined outside the hook (SWR v2 passes an AbortSignal as 2nd arg)
type HttpError = Error & { status?: number; body?: unknown }
type SearchResponse = { daos: ExploreDaoWithChainId[]; hasNextPage?: boolean }
const searchFetcher = async (
  [, searchText, network, page]: readonly [string, string, string, string?],
  { signal }: { signal?: AbortSignal } = {}
): Promise<SearchResponse> => {
  const params = new URLSearchParams()
  params.set('search', searchText)
  params.set('network', network)
  if (page) {
    params.set('page', page)
  }

  const url = `${BASE_URL}/api/search?${params.toString()}`

  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : {}
  if (!response.ok) {
    const err: HttpError = new Error(body?.error || response.statusText)
    err.status = response.status
    err.body = body
    throw err
  }
  return body as SearchResponse
}

/**
 * Hook for searching DAOs with debouncing and caching
 * @param query - The search query string
 * @param network - The chain slug (e.g., 'ethereum', 'base', 'optimism')
 * @param options - Additional options for the search including pagination
 */
export function useDaoSearch(
  query: string,
  network: string,
  options: UseDaoSearchOptions = {}
): DaoSearchResult {
  const { debounceMs = DEFAULT_DEBOUNCE_MS, enabled = true, page } = options

  // Normalize page parameter
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    let isMounted = true
    const timeout = setTimeout(() => {
      if (isMounted) {
        setDebouncedQuery(query)
      }
    }, debounceMs)

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [query, debounceMs])

  // Build search text from the debounced query
  const searchText = debouncedQuery?.trim() ? buildSearchText(debouncedQuery.trim()) : ''

  // Create SWR key - only when enabled, has searchText, and has network
  const swrKey =
    enabled && searchText && network
      ? ([SWR_KEYS.DAO_SEARCH, searchText, network, page] as const)
      : null

  // Use SWR for data fetching with caching
  const { data, error, isLoading, isValidating } = useSWR<SearchResponse, HttpError>(
    swrKey,
    searchFetcher,
    {
      // Prevent automatic revalidation on focus/reconnect for search
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Keep data fresh for 30 seconds
      dedupingInterval: 30000,
      // Custom error retry logic
      shouldRetryOnError: (error) => {
        // Don't retry 4xx errors
        return !(error?.status && error.status >= 400 && error.status < 500)
      },
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    }
  )

  const isEmpty =
    !!swrKey &&
    !isLoading &&
    !isValidating &&
    !error &&
    (!data?.daos || data.daos.length === 0)

  return {
    daos: data?.daos ?? [],
    error,
    isLoading: isLoading && !!swrKey,
    isEmpty,
    hasNextPage: data?.hasNextPage,
  }
}

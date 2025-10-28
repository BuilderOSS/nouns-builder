import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { type ExploreDaoWithChainId } from '@buildeross/sdk/subgraph'
import { buildSearchText } from '@buildeross/utils/search'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'

export interface DaoSearchResult {
  daos?: ExploreDaoWithChainId[]
  error?: Error
  isLoading: boolean
  isEmpty: boolean
}

interface UseDaoSearchOptions {
  debounceMs?: number
  enabled?: boolean
}

const DEFAULT_DEBOUNCE_MS = 300

// Fetcher function defined outside the hook (SWR v2 passes an AbortSignal as 2nd arg)
type HttpError = Error & { status?: number; body?: unknown }
type SearchResponse = { daos: ExploreDaoWithChainId[] }
const searchFetcher = async (
  [, searchText, network]: readonly [string, string, string],
  { signal }: { signal?: AbortSignal } = {}
): Promise<SearchResponse> => {
  const params = new URLSearchParams()
  params.set('search', searchText)
  params.set('network', network)

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
 * @param options - Additional options for the search
 */
export function useDaoSearch(
  query: string,
  network: string,
  options: UseDaoSearchOptions = {}
): DaoSearchResult {
  const { debounceMs = DEFAULT_DEBOUNCE_MS, enabled = true } = options

  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce the search query using useEffect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query, debounceMs])

  // Build search text from the debounced query
  const searchText = debouncedQuery?.trim() ? buildSearchText(debouncedQuery.trim()) : ''

  // Create SWR key - only when enabled, has searchText, and has network
  const swrKey =
    enabled && searchText && network
      ? ([SWR_KEYS.DAO_SEARCH, searchText, network] as const)
      : null

  // Use SWR for data fetching with caching
  const { data, error, isLoading } = useSWR<SearchResponse, HttpError>(
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
      // Optional: reduce UI flicker while typing
      keepPreviousData: true,
    }
  )

  const isEmpty = !!swrKey && !isLoading && (!data?.daos || data.daos.length === 0)

  return {
    daos: data?.daos,
    error,
    isLoading: isLoading && !!swrKey,
    isEmpty,
  }
}

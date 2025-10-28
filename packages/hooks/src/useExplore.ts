import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { ExploreDaosResponse } from '@buildeross/sdk/subgraph'
import useSWR from 'swr'

export interface UseExploreOptions {
  page?: string | string[]
  orderBy?: string | string[]
  chainSlug: string
  enabled?: boolean
}

export interface UseExploreResult {
  daos?: ExploreDaosResponse['daos']
  hasNextPage: boolean
  isLoading: boolean
  error?: Error
}

// Fetcher function for explore API
const exploreFetcher = async ([, _page, _orderBy, _chainSlug]: [
  string,
  string | string[] | undefined,
  string | string[] | undefined,
  string,
]) => {
  const params = new URLSearchParams()
  if (_page) params.set('page', Array.isArray(_page) ? _page[0] : _page)
  if (_orderBy) params.set('orderBy', Array.isArray(_orderBy) ? _orderBy[0] : _orderBy)
  if (_chainSlug) params.set('network', _chainSlug)

  const url = `${BASE_URL}/api/explore?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Explore API failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<ExploreDaosResponse>
}

/**
 * Hook for fetching explore page data with pagination and sorting
 * @param options - Configuration options for the explore query
 */
export function useExplore(options: UseExploreOptions): UseExploreResult {
  const { page, orderBy, chainSlug, enabled = true } = options

  // Create SWR key - only when enabled
  const swrKey = enabled ? ([SWR_KEYS.EXPLORE, page, orderBy, chainSlug] as const) : null

  // Use SWR for data fetching with caching
  const { data, error, isLoading } = useSWR(swrKey, exploreFetcher, {
    // Revalidate on focus for fresh data
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    // Keep data fresh for 30 seconds
    dedupingInterval: 30000,
    // Standard retry logic
    errorRetryCount: 3,
    errorRetryInterval: 1000,
  })

  return {
    daos: data?.daos,
    hasNextPage: data?.hasNextPage ?? false,
    isLoading: isLoading && !!swrKey,
    error,
  }
}

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

type HttpError = Error & { status?: number; body?: unknown }
// Fetcher function for explore API
const exploreFetcher = async (
  [, _page, _orderBy, _chainSlug]: [
    string,
    string | undefined,
    string | undefined,
    string,
  ],
  { signal }: { signal?: AbortSignal } = {}
): Promise<ExploreDaosResponse> => {
  const params = new URLSearchParams()
  if (_page) params.set('page', _page)
  if (_orderBy) params.set('orderBy', _orderBy)
  if (_chainSlug) params.set('network', _chainSlug)

  const url = `${BASE_URL}/api/explore?${params.toString()}`

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
  return body as ExploreDaosResponse
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
  const { data, error, isLoading } = useSWR<ExploreDaosResponse, HttpError>(
    swrKey,
    exploreFetcher,
    {
      // Revalidate on focus for fresh data
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      // Keep data fresh for 30 seconds
      dedupingInterval: 30000,
      // Standard retry logic
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  return {
    daos: data?.daos,
    hasNextPage: data?.hasNextPage ?? false,
    isLoading: isLoading && !!swrKey,
    error,
  }
}

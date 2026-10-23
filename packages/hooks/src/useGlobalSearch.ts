import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  type GlobalSearchResponse,
  type GlobalSearchType,
} from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

export const GLOBAL_SEARCH_MIN_LENGTH = 3

type HttpError = Error & { status?: number; body?: unknown }

export interface UseGlobalSearchOptions {
  debounceMs?: number
  enabled?: boolean
  /** Restrict to these result types (default: all) */
  types?: GlobalSearchType[]
  chainIds?: CHAIN_ID[]
  /** Scope results to one DAO */
  scope?: { chainId: CHAIN_ID; daoAddress: string }
  page?: number
  limit?: number
}

export interface UseGlobalSearchResult {
  data?: GlobalSearchResponse
  error?: HttpError
  /** True while the first response for the current query is loading */
  isLoading: boolean
  /** True while any request (including a refresh of previous data) is in flight */
  isValidating: boolean
  /** True once a response arrived with no results in any group */
  isEmpty: boolean
  /** The debounced query the current request is for */
  searchText: string
  /**
   * True when `data` was produced by an earlier request (a different query, tab or
   * scope) and is only kept on screen while the current request loads or after it failed
   */
  isPreviousData: boolean
}

/** A response tagged with the request URL (query + filters) that produced it */
type TaggedResponse = { url: string; response: GlobalSearchResponse }

type GlobalSearchKey = readonly [typeof SWR_KEYS.GLOBAL_SEARCH, string]

const globalSearchFetcher = async (
  [, url]: GlobalSearchKey,
  { signal }: { signal?: AbortSignal } = {}
): Promise<TaggedResponse> => {
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
  return { url, response: body as GlobalSearchResponse }
}

export const buildGlobalSearchUrl = (
  query: string,
  { types, chainIds, scope, page, limit }: UseGlobalSearchOptions = {}
): string => {
  const params = new URLSearchParams()
  params.set('q', query)
  if (types?.length) params.set('types', types.join(','))
  if (chainIds?.length) params.set('chainIds', chainIds.join(','))
  if (scope) {
    params.set('dao', scope.daoAddress)
    params.set('chainId', String(scope.chainId))
  }
  if (page && page > 1) params.set('page', String(page))
  if (limit) params.set('limit', String(limit))
  return `${BASE_URL}/api/global-search?${params.toString()}`
}

/**
 * Debounced search across DAOs, profiles, proposals, candidates, votes and bids.
 * Previous results stay visible while the next query loads.
 */
export function useGlobalSearch(
  query: string,
  options: UseGlobalSearchOptions = {}
): UseGlobalSearchResult {
  const { debounceMs = 250, enabled = true } = options

  const [debouncedQuery, setDebouncedQuery] = useState(query)
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), debounceMs)
    return () => clearTimeout(timeout)
  }, [query, debounceMs])

  const searchText = debouncedQuery.trim()
  const url = buildGlobalSearchUrl(searchText, options)
  const swrKey: GlobalSearchKey | null =
    enabled && searchText.length >= GLOBAL_SEARCH_MIN_LENGTH
      ? [SWR_KEYS.GLOBAL_SEARCH, url]
      : null

  const {
    data: tagged,
    error,
    isLoading,
    isValidating,
  } = useSWR<TaggedResponse, HttpError>(swrKey, globalSearchFetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 30000,
    shouldRetryOnError: (err) => !(err?.status && err.status >= 400 && err.status < 500),
    errorRetryCount: 2,
    errorRetryInterval: 1000,
  })

  const data = tagged?.response
  const hasAnyResult =
    !!data && Object.values(data.results).some((group) => group.length > 0)

  return {
    data: swrKey ? data : undefined,
    error: swrKey ? error : undefined,
    isLoading: !!swrKey && isLoading,
    isValidating: !!swrKey && isValidating,
    isEmpty: !!swrKey && !!data && !isValidating && !error && !hasAnyResult,
    searchText,
    isPreviousData: !!swrKey && !!tagged && tagged.url !== url,
  }
}

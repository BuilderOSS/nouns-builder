import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { type MyDaosResponse } from '@buildeross/sdk/subgraph'
import useSWR from 'swr'
import { isAddress } from 'viem'

export interface UseUserDaosOptions {
  address?: string
  enabled?: boolean
}

export interface UseUserDaosResult {
  daos: MyDaosResponse
  error?: HttpError
  isLoading: boolean
  isEmpty: boolean
}

// Fetcher function defined outside the hook (SWR v2 passes an AbortSignal as 2nd arg)
type HttpError = Error & { status?: number; body?: unknown }
const searchFetcher = async (
  [, address]: [string, string],
  { signal }: { signal?: AbortSignal } = {}
): Promise<MyDaosResponse> => {
  const url = `${BASE_URL}/api/daos/${address}`

  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : []
  if (!response.ok) {
    const err: HttpError = new Error(body?.error || response.statusText)
    err.status = response.status
    err.body = body
    throw err
  }
  return body as MyDaosResponse
}

/**
 * Hook for fetching DAOs that user is a member of
 * @param options - Configuration options for the user DAOs query
 */
export function useUserDaos(options: UseUserDaosOptions = {}): UseUserDaosResult {
  const { address, enabled = true } = options

  const swrKey =
    enabled && address && isAddress(address, { strict: false })
      ? ([SWR_KEYS.MY_DAOS, address.toLowerCase()] as const)
      : null

  // Use SWR for data fetching with caching
  const { data, error, isLoading, isValidating } = useSWR<MyDaosResponse, HttpError>(
    swrKey,
    searchFetcher,
    {
      // Don't revalidate on focus for my DAOs
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      // Keep data fresh for 60 seconds
      dedupingInterval: 60000,
      // Standard retry logic
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  const isEmpty =
    !!swrKey && !isLoading && !isValidating && !error && (!data || data.length === 0)

  return {
    daos: data ?? [],
    error,
    isLoading: isLoading && !!swrKey,
    isEmpty,
  }
}

import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { exploreMyDaosRequest } from '@buildeross/sdk/subgraph'
import { type ExploreDaoWithChainId } from '@buildeross/sdk/subgraph'
import useSWR from 'swr'
import { isAddress } from 'viem'

export interface UseExploreUserDaosOptions {
  address?: string
  enabled?: boolean
}

export interface UseExploreUserDaosResult {
  daos?: ExploreDaoWithChainId[]
  isEmpty: boolean
  isLoading: boolean
  error?: Error
}

// Fetcher function for my DAOs request
const myDaosFetcher = async ([, _address]: [string, string]) => {
  return exploreMyDaosRequest(_address)
}

/**
 * Hook for fetching user's DAOs
 * @param options - Configuration options for the my DAOs query
 */
export function useExploreUserDaos(
  options: UseExploreUserDaosOptions = {}
): UseExploreUserDaosResult {
  const { address, enabled = true } = options

  // Create SWR key - only when enabled and has address
  const swrKey =
    enabled && address && isAddress(address, { strict: false })
      ? ([SWR_KEYS.MY_DAOS_PAGE, address.toLowerCase()] as const)
      : null

  // Use SWR for data fetching with caching
  const { data, error, isValidating } = useSWR(swrKey, myDaosFetcher, {
    // Don't revalidate on focus for my DAOs
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    // Keep data fresh for 60 seconds
    dedupingInterval: 60000,
    // Standard retry logic
    errorRetryCount: 3,
    errorRetryInterval: 1000,
    // Custom error retry logic
    shouldRetryOnError: (error) => {
      // Don't retry 4xx errors
      return !(error?.status && error.status >= 400 && error.status < 500)
    },
  })

  const isLoading = data ? false : isValidating && !data && !error

  const isEmpty =
    !!swrKey && !isLoading && !isValidating && !error && (!data || data.daos.length === 0)

  return {
    daos: data?.daos ?? [],
    isEmpty,
    isLoading,
    error,
  }
}

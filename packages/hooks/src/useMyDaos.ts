import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { exploreMyDaosRequest } from '@buildeross/sdk/subgraph'
import { type ExploreDaoWithChainId } from '@buildeross/sdk/subgraph'
import useSWR from 'swr'

export interface UseMyDaosOptions {
  address?: string
  enabled?: boolean
}

export interface UseMyDaosResult {
  daos?: ExploreDaoWithChainId[]
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
export function useMyDaos(options: UseMyDaosOptions = {}): UseMyDaosResult {
  const { address, enabled = true } = options

  // Create SWR key - only when enabled and has address
  const swrKey =
    enabled && address
      ? ([SWR_KEYS.DYNAMIC.MY_DAOS_PAGE(address), address] as const)
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
  })

  const isLoading = data ? false : isValidating && !data && !error

  return {
    daos: data?.daos,
    isLoading,
    error,
  }
}

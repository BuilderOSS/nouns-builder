import { BASE_URL } from '@buildeross/constants/baseUrl'
import type { CHAIN_ID } from '@buildeross/types'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

export interface PopularToken {
  address: Address
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  isNative?: boolean
}

interface PopularTokensResponse {
  success: boolean
  data: PopularToken[]
  chainId: number
}

const fetchPopularTokens = async (
  chainId: number,
  signal?: AbortSignal
): Promise<PopularTokensResponse> => {
  const response = await fetch(`${BASE_URL}/api/uniswap/tokens?chainId=${chainId}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch popular tokens: ${response.status}`)
  }

  return response.json()
}

/**
 * Hook to fetch popular tokens for a given chain
 * Returns a curated list of commonly traded tokens on Base/Base Sepolia
 */
export function usePopularTokens(chainId?: CHAIN_ID) {
  const { data, error, isLoading } = useQuery<PopularTokensResponse, Error>({
    queryKey: ['popular-tokens', chainId],
    queryFn: ({ signal }) => fetchPopularTokens(chainId!, signal),
    enabled: !!chainId,
    staleTime: 60 * 60 * 1000, // 1 hour - tokens rarely change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours in cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return {
    tokens: data?.data || [],
    isLoading,
    error: error || null,
  }
}

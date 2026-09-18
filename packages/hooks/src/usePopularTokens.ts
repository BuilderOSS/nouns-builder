import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { CHAIN_ID } from '@buildeross/types'
import useSWR from 'swr'
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

const fetchPopularTokens = async (chainId: number): Promise<PopularTokensResponse> => {
  const response = await fetch(`${BASE_URL}/api/uniswap/tokens?chainId=${chainId}`)

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
  const { data, error, isLoading } = useSWR(
    chainId ? ([SWR_KEYS.POPULAR_TOKENS, chainId] as const) : null,
    async ([, _chainId]) => fetchPopularTokens(_chainId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Cache popular tokens for 1 hour
      dedupingInterval: 3600000,
    }
  )

  return {
    tokens: data?.data || [],
    isLoading,
    error: error || null,
  }
}

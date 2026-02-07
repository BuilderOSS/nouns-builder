import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'
import { type Address } from 'viem'

export type TokenPrice = {
  address: string
  price: string // USD price as string
}

export type TokenPricesReturnType = {
  prices: Record<string, number> | undefined // address -> USD price
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<TokenPrice[]>
}

const fetchTokenPrices = async (
  chainId: CHAIN_ID,
  addresses: Address[]
): Promise<TokenPrice[]> => {
  const params = new URLSearchParams()
  params.set('chainId', chainId.toString())
  params.set('addresses', addresses.join(','))

  const response = await fetch(
    `${BASE_URL}/api/alchemy/token-prices?${params.toString()}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch token prices')
  }
  const result = await response.json()
  return result.data || []
}

/**
 * Hook to fetch token prices in USD from Alchemy API
 *
 * @param chainId - The chain ID to fetch prices for
 * @param addresses - Array of token addresses to fetch prices for (max 25)
 * @returns An object with token prices mapped by address, loading states, and error
 */
export const useTokenPrices = (
  chainId?: CHAIN_ID,
  addresses?: Address[]
): TokenPricesReturnType => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!addresses && addresses.length > 0 && !!chainId
      ? ([SWR_KEYS.TOKEN_PRICES, chainId, addresses.join(',')] as const)
      : null,
    async ([, _chainId, _addresses]) => {
      const addressArray = (_addresses as string).split(',') as Address[]
      return fetchTokenPrices(_chainId as CHAIN_ID, addressArray)
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000, // Refresh every 60 seconds
    }
  )

  // Convert array of TokenPrice to Record<address, number>
  const pricesMap = data?.reduce(
    (acc, tokenPrice) => {
      acc[tokenPrice.address.toLowerCase()] = parseFloat(tokenPrice.price) || 0
      return acc
    },
    {} as Record<string, number>
  )

  return {
    prices: pricesMap,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}

/**
 * Get the price for a specific token by address
 * This is a synchronous helper that works with the hook's result
 *
 * @param prices - The prices map from useTokenPrices hook
 * @param address - The token address
 * @returns The price in USD, or null if not found
 */
export const getTokenPriceFromMap = (
  prices: Record<string, number> | undefined,
  address: string
): number | null => {
  if (!prices) return null
  return prices[address.toLowerCase()] ?? null
}

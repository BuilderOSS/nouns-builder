import { buildSwapOptions, SwapOption as SwapOptionType } from '@buildeross/swap'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useEffect, useState } from 'react'

// Re-export SwapOption type from swap package
export type SwapOption = SwapOptionType

export interface UseSwapOptionsResult {
  options: SwapOption[]
  isLoading: boolean
  error: Error | null
}

/**
 * Fetches all available payment tokens for swapping with a specific coin
 * Returns ETH, WETH, and any intermediate tokens discovered in the swap path
 * Each option includes the token info and the swap path from that token to the coin
 */
export function useSwapOptions(
  chainId: CHAIN_ID,
  coinAddress: AddressType,
  isBuying: boolean = true
): UseSwapOptionsResult {
  const [options, setOptions] = useState<SwapOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchOptions() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await buildSwapOptions(chainId, coinAddress as any, isBuying)

        if (!cancelled) {
          if (result) {
            setOptions(result.options)
          } else {
            setOptions([])
          }
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch swap options'))
          setIsLoading(false)
        }
      }
    }

    fetchOptions()

    return () => {
      cancelled = true
    }
  }, [chainId, coinAddress, isBuying])

  return { options, isLoading, error }
}

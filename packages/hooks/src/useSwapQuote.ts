import { getQuoteFromUniswap, SwapPath } from '@buildeross/swap'
import { CHAIN_ID } from '@buildeross/types'
import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'

interface UseSwapQuoteParams {
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  path?: SwapPath | null
  amountIn?: bigint
  slippage?: number
  enabled?: boolean
}

interface UseSwapQuoteReturn {
  amountOut: bigint | null
  minAmountOut: bigint | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to get a quote for a swap using Uniswap V4 Quoter
 */
export function useSwapQuote({
  chainId,
  path,
  amountIn,
  slippage = 0.01,
  enabled = true,
}: UseSwapQuoteParams): UseSwapQuoteReturn {
  const [amountOut, setAmountOut] = useState<bigint | null>(null)
  const [minAmountOut, setMinAmountOut] = useState<bigint | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const publicClient = usePublicClient({ chainId })

  const refetch = () => setRefetchTrigger((prev) => prev + 1)

  useEffect(() => {
    if (!enabled || !path || !amountIn || !publicClient) {
      setAmountOut(null)
      setMinAmountOut(null)
      setIsLoading(false)
      setError(null)
      return
    }

    // Validate amount
    if (amountIn === 0n) {
      setAmountOut(null)
      setMinAmountOut(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    const fetchQuote = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const quote = await getQuoteFromUniswap({
          publicClient,
          chainId,
          path,
          amountIn,
          slippage,
        })

        if (!cancelled) {
          setAmountOut(quote.amountOut)
          setMinAmountOut(quote.minAmountOut)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to get quote'))
          setIsLoading(false)
        }
      }
    }

    fetchQuote()

    return () => {
      cancelled = true
    }
  }, [publicClient, chainId, path, amountIn, slippage, enabled, refetchTrigger])

  return { amountOut, minAmountOut, isLoading, error, refetch }
}

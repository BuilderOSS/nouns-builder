import { buildSwapPath, SwapPath } from '@buildeross/swap'
import { CHAIN_ID } from '@buildeross/types'
import { useEffect, useState } from 'react'
import { Address } from 'viem'

interface UseSwapPathParams {
  chainId: CHAIN_ID
  tokenIn?: Address
  tokenOut?: Address
  enabled?: boolean
}

interface UseSwapPathReturn {
  path: SwapPath | null
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to build a swap path between two tokens
 */
export function useSwapPath({
  chainId,
  tokenIn,
  tokenOut,
  enabled = true,
}: UseSwapPathParams): UseSwapPathReturn {
  const [path, setPath] = useState<SwapPath | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled || !tokenIn || !tokenOut) {
      setPath(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    const fetchPath = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await buildSwapPath(chainId, tokenIn, tokenOut)

        if (!cancelled) {
          setPath(result)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to build swap path'))
          setIsLoading(false)
        }
      }
    }

    fetchPath()

    return () => {
      cancelled = true
    }
  }, [chainId, tokenIn, tokenOut, enabled])

  return { path, isLoading, error }
}

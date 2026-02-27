import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  getPoolMaxSwapAmount,
  type PoolMaxSwapAmountResult,
  type SwapPath,
} from '@buildeross/swap'
import { CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'
import { usePublicClient } from 'wagmi'

interface UsePoolMaxSwapAmountParams {
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  path?: SwapPath | null
  userBalance: bigint
  isZoraCoin?: boolean
  isBuying: boolean
  enabled?: boolean
}

type UsePoolMaxSwapAmountReturn =
  | {
      maxAmountIn: bigint
      sqrtPriceX96: bigint
      tick: number
      liquidity: bigint
      isLoading: false
      isValidating: boolean
      error: undefined
      mutate: KeyedMutator<PoolMaxSwapAmountResult>
    }
  | {
      maxAmountIn: null
      sqrtPriceX96: null
      tick: null
      liquidity: null
      isLoading: true
      isValidating: boolean
      error: undefined
      mutate: KeyedMutator<PoolMaxSwapAmountResult>
    }
  | {
      maxAmountIn: null
      sqrtPriceX96: null
      tick: null
      liquidity: null
      isLoading: false
      isValidating: boolean
      error: undefined
      mutate: KeyedMutator<PoolMaxSwapAmountResult>
    }
  | {
      maxAmountIn: null
      sqrtPriceX96: null
      tick: null
      liquidity: null
      isLoading: boolean
      isValidating: boolean
      error: Error
      mutate: KeyedMutator<PoolMaxSwapAmountResult>
    }

/**
 * Hook to get the maximum swap amount using binary search
 * Similar to useSwapQuote but finds the max amount that won't fail
 * Uses SWR for caching and automatic revalidation
 */
export function usePoolMaxSwapAmount({
  chainId,
  path,
  userBalance,
  isZoraCoin = false,
  isBuying,
  enabled = true,
}: UsePoolMaxSwapAmountParams): UsePoolMaxSwapAmountReturn {
  const publicClient = usePublicClient({ chainId })

  // Build a unique cache key from the parameters
  // Key by the relevant token based on swap direction:
  // - When buying: key by tokenOut (the coin being bought)
  // - When selling: key by tokenIn (the coin being sold)
  // This allows ETH/WETH to share the same cache for the same coin
  const shouldFetch =
    enabled && path && path.hops?.length > 0 && publicClient && userBalance > 0n

  const relevantToken = path
    ? isBuying
      ? path.hops[path.hops.length - 1]?.tokenOut // Last hop's output when buying
      : path.hops[0]?.tokenIn // First hop's input when selling
    : null

  const swrKey = shouldFetch
    ? [
        SWR_KEYS.POOL_MAX_SWAP_AMOUNT,
        chainId,
        relevantToken,
        userBalance.toString(),
        isZoraCoin,
        isBuying,
      ]
    : null

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      if (!path || !publicClient) {
        throw new Error('Missing required parameters')
      }

      if (!path.hops || path.hops.length === 0) {
        throw new Error('Swap path has no hops')
      }

      // Find the hop that contains the token we care about
      // When buying: find hop where tokenOut matches (last hop typically)
      // When selling: find hop where tokenIn matches (first hop typically)
      const relevantHop = isBuying
        ? path.hops.find(
            (h) => h.tokenOut.toLowerCase() === relevantToken?.toLowerCase()
          ) || path.hops[path.hops.length - 1] // Fallback to last hop
        : path.hops.find(
            (h) => h.tokenIn.toLowerCase() === relevantToken?.toLowerCase()
          ) || path.hops[0] // Fallback to first hop

      // Validate hop has required pool info
      if (
        !relevantHop ||
        relevantHop.fee == null ||
        !relevantHop.tickSpacing ||
        !relevantHop.hooks
      ) {
        throw new Error('Missing pool information in swap path')
      }

      // Get max swap amount using binary search
      // Pass the hop directly so getPoolMaxSwapAmount can normalize addresses properly
      return await getPoolMaxSwapAmount({
        publicClient,
        chainId,
        hop: relevantHop,
        userBalance,
        isZoraCoin,
      })
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Don't auto-refresh since pool liquidity doesn't change that frequently
      // User can manually trigger refresh if needed
      refreshInterval: 0,
      // Keep data fresh for 30 seconds
      dedupingInterval: 30000,
    }
  )

  if (error) {
    return {
      maxAmountIn: null,
      sqrtPriceX96: null,
      tick: null,
      liquidity: null,
      isLoading,
      isValidating,
      error,
      mutate,
    }
  }

  if (isLoading || (!data && shouldFetch)) {
    return {
      maxAmountIn: null,
      sqrtPriceX96: null,
      tick: null,
      liquidity: null,
      isLoading: true,
      isValidating,
      error: undefined,
      mutate,
    }
  }

  // If fetching is disabled (shouldFetch is false), return null values with isLoading: false
  if (!data) {
    return {
      maxAmountIn: null,
      sqrtPriceX96: null,
      tick: null,
      liquidity: null,
      isLoading: false,
      isValidating,
      error: undefined,
      mutate,
    }
  }

  return {
    maxAmountIn: data.maxAmountIn,
    sqrtPriceX96: data.sqrtPriceX96,
    tick: data.tick,
    liquidity: data.liquidity,
    isLoading: false,
    isValidating,
    error: undefined,
    mutate,
  }
}

import { WETH_ADDRESS } from '@buildeross/constants'
import { type ClankerTokenFragment, clankerTokenRequest } from '@buildeross/sdk/subgraph'
import { type AddressType, CHAIN_ID } from '@buildeross/types'
import { isCoinSupportedChain } from '@buildeross/utils/helpers'
import { useEffect, useRef, useState } from 'react'
import { getAddress, type PublicClient } from 'viem'
import { usePublicClient } from 'wagmi'

import {
  CACHE_TTL,
  type CacheEntry,
  calculatePriceFromSqrtPriceX96,
  fetchSlot0,
  getCached,
  inflightUsdPrice,
  setCached,
  usdPriceCache,
} from './priceUtils'
import { useEthUsdPrice } from './useEthUsdPrice'

// ClankerToken-specific caches
const clankerTokenCache = new Map<string, CacheEntry<ClankerTokenFragment | null>>()
const inflightClankerToken = new Map<string, Promise<ClankerTokenFragment | null>>()

/**
 * Fetch ClankerToken from subgraph with caching and deduplication
 */
async function fetchClankerToken(
  tokenAddress: string,
  chainId: CHAIN_ID,
  signal?: AbortSignal
): Promise<ClankerTokenFragment | null> {
  const normalizedAddress = getAddress(tokenAddress)
  const cacheKey = `${chainId}:${normalizedAddress}`

  // Check cache first
  const cached = getCached(clankerTokenCache, cacheKey)
  if (cached !== undefined) {
    return cached
  }

  // Check if already in-flight
  const inflight = inflightClankerToken.get(cacheKey)
  if (inflight) {
    return inflight
  }

  // Start new request
  const promise = (async () => {
    try {
      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      const result = await clankerTokenRequest(normalizedAddress as AddressType, chainId)

      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      // Cache the result (including null)
      const ttl = result ? CACHE_TTL.SUBGRAPH : CACHE_TTL.NULL_RESULT
      setCached(clankerTokenCache, cacheKey, result, ttl)

      return result
    } finally {
      inflightClankerToken.delete(cacheKey)
    }
  })()

  inflightClankerToken.set(cacheKey, promise)
  return promise
}

/**
 * Recursively fetch the USD price of a token with caching and deduplication
 * Supports up to 2 levels of depth (ClankerToken -> ClankerToken -> WETH)
 *
 * Depth levels:
 * - depth 0 = original token
 * - depth 1 = paired token
 * - depth 2 = WETH (allowed)
 * - depth > 2 = return null
 *
 * @param tokenAddress - The address of the token to price (will be normalized)
 * @param chainId - The chain ID
 * @param publicClient - The viem public client
 * @param ethUsdPrice - The current ETH/USD price
 * @param depth - Current recursion depth (max 2)
 * @param signal - AbortSignal for cancellation
 * @returns The USD price of the token, or null if it cannot be determined
 */
export async function fetchClankerTokenUsdPrice(
  tokenAddress: string,
  chainId: CHAIN_ID,
  publicClient: PublicClient,
  ethUsdPrice: number,
  depth: number = 0,
  signal?: AbortSignal
): Promise<number | null> {
  // Normalize address once
  const normalizedAddress = getAddress(tokenAddress)

  // Base case: if it's WETH, return the ETH USD price directly (no caching)
  // Check this BEFORE depth cutoff to allow WETH at depth 2
  const wethAddress = WETH_ADDRESS[chainId as keyof typeof WETH_ADDRESS]
  if (wethAddress && normalizedAddress === getAddress(wethAddress)) {
    return ethUsdPrice
  }

  // Max depth cutoff AFTER WETH check
  // This allows: depth 0 (original) -> depth 1 (paired) -> depth 2 (WETH)
  if (depth > 2) {
    return null
  }

  // Cache key for USD price (rely on TTL for freshness, not ETH price in key)
  const cacheKey = `${chainId}:${normalizedAddress}`

  // Check cache first for all depths (including depth 0)
  const cached = getCached(usdPriceCache, cacheKey)
  if (cached !== undefined) {
    return cached
  }

  // Check if already in-flight for all depths
  const inflight = inflightUsdPrice.get(cacheKey)
  if (inflight) {
    return inflight
  }

  // Start computation with deduplication for all depths
  const computePrice = async (): Promise<number | null> => {
    try {
      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      // Fetch ClankerToken from subgraph
      const clankerToken = await fetchClankerToken(normalizedAddress, chainId, signal)

      if (!clankerToken) {
        // Negative cache: clankerToken not found
        setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
        return null
      }

      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      // Fetch slot0 data
      const slot0Result = await fetchSlot0(
        clankerToken.poolId as `0x${string}`,
        chainId,
        publicClient,
        signal
      )

      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      const sqrtPriceX96 = slot0Result[0]

      // Normalize paired token address once
      const pairedTokenAddress = getAddress(clankerToken.pairedToken)

      // Determine token order in the pool using lowercase string comparison
      const isToken0 = normalizedAddress.toLowerCase() < pairedTokenAddress.toLowerCase()

      // Calculate the price in terms of the paired token
      const priceInPairedToken = calculatePriceFromSqrtPriceX96(sqrtPriceX96, isToken0)

      if (priceInPairedToken === null) {
        // Negative cache: price calculation failed
        setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
        return null
      }

      // Recursively get the USD price of the paired token
      const pairedTokenUsdPrice = await fetchClankerTokenUsdPrice(
        pairedTokenAddress,
        chainId,
        publicClient,
        ethUsdPrice,
        depth + 1,
        signal
      )

      if (pairedTokenUsdPrice === null) {
        // Negative cache: paired token price not available
        setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
        return null
      }

      // Calculate the USD price of this token
      const usdPrice = priceInPairedToken * pairedTokenUsdPrice

      // Cache the computed USD price (for all depths)
      setCached(usdPriceCache, cacheKey, usdPrice, CACHE_TTL.USD_PRICE)

      return usdPrice
    } catch (err) {
      if (signal?.aborted || (err instanceof Error && err.message === 'Aborted')) {
        throw err
      }
      console.error(`Error fetching price for token ${normalizedAddress}:`, err)
      // Negative cache: error occurred
      setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
      return null
    } finally {
      // Clean up in-flight promise for all depths
      inflightUsdPrice.delete(cacheKey)
    }
  }

  // Deduplicate in-flight requests for all depths
  const promise = computePrice()
  inflightUsdPrice.set(cacheKey, promise)
  return promise
}

export const useClankerTokenPrice = ({
  clankerToken,
  chainId,
  enabled = true,
}: {
  clankerToken?: ClankerTokenFragment | null
  chainId: CHAIN_ID
  enabled?: boolean
}): {
  priceUsd: number | null
  isLoading: boolean
  error: Error | null
} => {
  const publicClient = usePublicClient({ chainId })
  const [priceUsd, setPriceUsd] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Use ref to track the current request ID to prevent stale updates
  const requestIdRef = useRef(0)

  // Fetch ETH USD price
  const {
    price: ethUsdPrice,
    isLoading: ethPriceLoading,
    error: ethPriceError,
  } = useEthUsdPrice()

  useEffect(() => {
    // Increment request ID for this effect run
    const currentRequestId = ++requestIdRef.current

    // Create abort controller for this effect run
    const abortController = new AbortController()

    const fetchPrice = async () => {
      // Helper to check if this request is still current
      const isCurrent = () => requestIdRef.current === currentRequestId

      // Check if chain is supported
      if (!isCoinSupportedChain(chainId)) {
        if (isCurrent()) {
          setPriceUsd(null)
          setIsLoading(false)
          setError(
            new Error(`ClankerToken pricing is only supported on Base and Base Sepolia`)
          )
        }
        return
      }

      if (!clankerToken?.tokenAddress || !enabled || !publicClient) {
        if (isCurrent()) {
          setPriceUsd(null)
          setIsLoading(false)
          setError(null)
        }
        return
      }

      // Wait for ETH price to be available
      if (ethPriceLoading) {
        if (isCurrent()) {
          setIsLoading(true)
        }
        return
      }

      // Handle ETH price error
      if (ethPriceError) {
        if (isCurrent()) {
          setIsLoading(false)
          setError(ethPriceError)
          setPriceUsd(null)
        }
        return
      }

      // Set loading state
      if (isCurrent()) {
        setIsLoading(true)
        setError(null)
      }

      try {
        // Use the recursive helper to fetch the token price
        // This will handle ClankerTokens paired with other ClankerTokens (up to depth 2)
        const calculatedPriceUsd = await fetchClankerTokenUsdPrice(
          clankerToken.tokenAddress,
          chainId,
          publicClient,
          ethUsdPrice,
          0,
          abortController.signal
        )

        // Only update state if this is still the current request
        if (!isCurrent()) {
          return
        }

        if (calculatedPriceUsd !== null) {
          setPriceUsd(calculatedPriceUsd)
          setError(null)
        } else {
          // Cannot price is not treated as an error, just null price
          setPriceUsd(null)
          setError(null)
        }
      } catch (err) {
        // Only update state if this is still the current request
        if (!isCurrent()) {
          return
        }

        // Don't treat abort as an error
        if (err instanceof Error && err.message === 'Aborted') {
          return
        }

        // Real errors (RPC errors, unexpected exceptions)
        console.error('Error fetching ClankerToken price:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setPriceUsd(null)
      } finally {
        // Only update loading state if this is still the current request
        if (isCurrent()) {
          setIsLoading(false)
        }
      }
    }

    fetchPrice()

    // Cleanup: abort on unmount or dependency change
    return () => {
      abortController.abort()
    }
  }, [
    clankerToken?.tokenAddress,
    enabled,
    publicClient,
    ethUsdPrice,
    ethPriceLoading,
    ethPriceError,
    chainId,
  ])

  return {
    priceUsd,
    isLoading,
    error,
  }
}

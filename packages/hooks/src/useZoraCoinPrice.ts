import { UNISWAP_STATE_VIEW_ADDRESS } from '@buildeross/constants'
import { type ZoraCoinFragment, zoraCoinRequest } from '@buildeross/sdk/subgraph'
import { type AddressType, CHAIN_ID } from '@buildeross/types'
import { isCoinSupportedChain } from '@buildeross/utils/helpers'
import { useEffect, useRef, useState } from 'react'
import { type Address, getAddress, parseAbi, type PublicClient } from 'viem'
import { usePublicClient } from 'wagmi'

import { fetchClankerTokenUsdPrice } from './useClankerTokenPrice'
import { useEthUsdPrice } from './useEthUsdPrice'

// Uniswap V4 StateView ABI - just the function we need
const UNISWAP_V4_STATE_VIEW_ABI = parseAbi([
  'function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
])

// Cache TTL constants (in milliseconds)
const CACHE_TTL = {
  SLOT0: 10_000, // 10 seconds for pool price data
  SUBGRAPH: 30_000, // 30 seconds for subgraph data
  USD_PRICE: 10_000, // 10 seconds for computed USD prices
  NULL_RESULT: 5_000, // 5 seconds for null results (negative cache)
} as const

// Cache entry type
interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

// In-memory caches
const slot0Cache = new Map<
  string,
  CacheEntry<readonly [bigint, number, number, number]>
>()
const zoraCoinCache = new Map<string, CacheEntry<ZoraCoinFragment | null>>()
const usdPriceCache = new Map<string, CacheEntry<number | null>>()

// In-flight promise deduplication
const inflightSlot0 = new Map<
  string,
  Promise<readonly [bigint, number, number, number]>
>()
const inflightZoraCoin = new Map<string, Promise<ZoraCoinFragment | null>>()
const inflightUsdPrice = new Map<string, Promise<number | null>>()

/**
 * Get value from cache if not expired
 */
function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined

  const now = Date.now()
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return undefined
  }

  return entry.value
}

/**
 * Set value in cache with TTL
 */
function setCached<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  value: T,
  ttl: number
): void {
  cache.set(key, {
    value,
    timestamp: Date.now(),
    ttl,
  })
}

// Pure bigint constants - never compute via JS number
const SCALE = 10n ** 18n // 1e18 for fixed-point scaling
const Q192 = 2n ** 192n // 2^192 for price math

/**
 * Safely convert a scaled bigint to a number
 * Splits into integer and fractional parts to avoid precision loss
 */
function scaledBigIntToNumber(scaled: bigint): number | null {
  const integer = scaled / SCALE
  const fraction = scaled % SCALE

  // Check if integer part is too large for safe conversion
  if (integer > BigInt(Number.MAX_SAFE_INTEGER)) {
    console.warn(
      `Price value too large for safe conversion: ${integer.toString()} (exceeds MAX_SAFE_INTEGER)`
    )
    return null
  }

  return Number(integer) + Number(fraction) / 1e18
}

/**
 * Calculate token price from sqrtPriceX96 using bigint-safe arithmetic
 * Assumes all tokens have 18 decimals
 */
function calculatePriceFromSqrtPriceX96(
  sqrtPriceX96: bigint,
  isToken0: boolean
): number | null {
  const rawPriceScaled = (sqrtPriceX96 * sqrtPriceX96 * SCALE) / Q192

  // If our token is token1, we need to invert the price
  if (!isToken0) {
    if (rawPriceScaled === 0n) {
      console.warn('Cannot invert zero price')
      return null
    }
    const invertedPriceScaled = (SCALE * SCALE) / rawPriceScaled
    return scaledBigIntToNumber(invertedPriceScaled)
  }

  return scaledBigIntToNumber(rawPriceScaled)
}

/**
 * Fetch slot0 data from StateView with caching and deduplication
 */
async function fetchSlot0(
  poolId: `0x${string}`,
  chainId: CHAIN_ID,
  publicClient: PublicClient,
  signal?: AbortSignal
): Promise<readonly [bigint, number, number, number]> {
  const cacheKey = `${chainId}:${poolId}`

  const cached = getCached(slot0Cache, cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const inflight = inflightSlot0.get(cacheKey)
  if (inflight) {
    return inflight
  }

  const promise = (async () => {
    try {
      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      const stateViewAddress =
        UNISWAP_STATE_VIEW_ADDRESS[chainId as keyof typeof UNISWAP_STATE_VIEW_ADDRESS]

      if (!stateViewAddress) {
        throw new Error(`StateView not available for chain ${chainId}`)
      }

      const result = await publicClient.readContract({
        address: stateViewAddress as Address,
        abi: UNISWAP_V4_STATE_VIEW_ABI,
        functionName: 'getSlot0',
        args: [poolId],
      })

      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      setCached(slot0Cache, cacheKey, result, CACHE_TTL.SLOT0)
      return result
    } finally {
      inflightSlot0.delete(cacheKey)
    }
  })()

  inflightSlot0.set(cacheKey, promise)
  return promise
}

/**
 * Fetch ZoraCoin from subgraph with caching and deduplication
 */
async function fetchZoraCoin(
  coinAddress: string,
  chainId: CHAIN_ID,
  signal?: AbortSignal
): Promise<ZoraCoinFragment | null> {
  const normalizedAddress = getAddress(coinAddress)
  const cacheKey = `${chainId}:${normalizedAddress}`

  const cached = getCached(zoraCoinCache, cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const inflight = inflightZoraCoin.get(cacheKey)
  if (inflight) {
    return inflight
  }

  const promise = (async () => {
    try {
      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      const result = await zoraCoinRequest(normalizedAddress as AddressType, chainId)

      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      const ttl = result ? CACHE_TTL.SUBGRAPH : CACHE_TTL.NULL_RESULT
      setCached(zoraCoinCache, cacheKey, result, ttl)

      return result
    } finally {
      inflightZoraCoin.delete(cacheKey)
    }
  })()

  inflightZoraCoin.set(cacheKey, promise)
  return promise
}

/**
 * Fetch the USD price of a ZoraCoin
 * ZoraCoins are always paired with ClankerTokens (via currency field)
 */
async function fetchZoraCoinUsdPrice(
  tokenAddress: string,
  chainId: CHAIN_ID,
  publicClient: PublicClient,
  ethUsdPrice: number,
  signal?: AbortSignal
): Promise<number | null> {
  const normalizedAddress = getAddress(tokenAddress)
  const cacheKey = `${chainId}:${normalizedAddress}`

  const cached = getCached(usdPriceCache, cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const inflight = inflightUsdPrice.get(cacheKey)
  if (inflight) {
    return inflight
  }

  const computePrice = async (): Promise<number | null> => {
    try {
      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      // Fetch ZoraCoin from subgraph
      const zoraCoin = await fetchZoraCoin(normalizedAddress, chainId, signal)

      if (!zoraCoin || !zoraCoin.poolKeyHash || !zoraCoin.currency) {
        setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
        return null
      }

      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      // Fetch slot0 data
      const slot0Result = await fetchSlot0(
        zoraCoin.poolKeyHash as `0x${string}`,
        chainId,
        publicClient,
        signal
      )

      if (signal?.aborted) {
        throw new Error('Aborted')
      }

      const sqrtPriceX96 = slot0Result[0]

      // Normalize currency address (ClankerToken)
      const currencyAddress = getAddress(zoraCoin.currency)

      // Determine token order in the pool
      const isToken0 = normalizedAddress.toLowerCase() < currencyAddress.toLowerCase()

      // Calculate the price in terms of the currency (ClankerToken)
      const priceInCurrency = calculatePriceFromSqrtPriceX96(sqrtPriceX96, isToken0)

      if (priceInCurrency === null) {
        setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
        return null
      }

      // Get the USD price of the currency (ClankerToken) using the ClankerToken pricing function
      const currencyUsdPrice = await fetchClankerTokenUsdPrice(
        currencyAddress,
        chainId,
        publicClient,
        ethUsdPrice,
        0,
        signal
      )

      if (currencyUsdPrice === null) {
        setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
        return null
      }

      // Calculate the USD price of this ZoraCoin
      const usdPrice = priceInCurrency * currencyUsdPrice

      setCached(usdPriceCache, cacheKey, usdPrice, CACHE_TTL.USD_PRICE)
      return usdPrice
    } catch (err) {
      if (signal?.aborted || (err instanceof Error && err.message === 'Aborted')) {
        throw err
      }
      console.error(`Error fetching price for ZoraCoin ${normalizedAddress}:`, err)
      setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
      return null
    } finally {
      inflightUsdPrice.delete(cacheKey)
    }
  }

  const promise = computePrice()
  inflightUsdPrice.set(cacheKey, promise)
  return promise
}

export const useZoraCoinPrice = ({
  zoraCoin,
  chainId,
  enabled = true,
}: {
  zoraCoin?: ZoraCoinFragment | null
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

  const requestIdRef = useRef(0)

  const {
    price: ethUsdPrice,
    isLoading: ethPriceLoading,
    error: ethPriceError,
  } = useEthUsdPrice()

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current
    const abortController = new AbortController()

    const fetchPrice = async () => {
      const isCurrent = () => requestIdRef.current === currentRequestId

      if (!isCoinSupportedChain(chainId)) {
        if (isCurrent()) {
          setPriceUsd(null)
          setIsLoading(false)
          setError(
            new Error(`Zora Coin pricing is only supported on Base and Base Sepolia`)
          )
        }
        return
      }

      if (!zoraCoin?.coinAddress || !enabled || !publicClient) {
        if (isCurrent()) {
          setPriceUsd(null)
          setIsLoading(false)
          setError(null)
        }
        return
      }

      if (ethPriceLoading) {
        if (isCurrent()) {
          setIsLoading(true)
        }
        return
      }

      if (ethPriceError) {
        if (isCurrent()) {
          setIsLoading(false)
          setError(ethPriceError)
          setPriceUsd(null)
        }
        return
      }

      if (isCurrent()) {
        setIsLoading(true)
        setError(null)
      }

      try {
        const calculatedPriceUsd = await fetchZoraCoinUsdPrice(
          zoraCoin.coinAddress,
          chainId,
          publicClient,
          ethUsdPrice,
          abortController.signal
        )

        if (!isCurrent()) {
          return
        }

        if (calculatedPriceUsd !== null) {
          setPriceUsd(calculatedPriceUsd)
          setError(null)
        } else {
          setPriceUsd(null)
          setError(null)
        }
      } catch (err) {
        if (!isCurrent()) {
          return
        }

        if (err instanceof Error && err.message === 'Aborted') {
          return
        }

        console.error('Error fetching Zora Coin price:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setPriceUsd(null)
      } finally {
        if (isCurrent()) {
          setIsLoading(false)
        }
      }
    }

    fetchPrice()

    return () => {
      abortController.abort()
    }
  }, [
    zoraCoin?.coinAddress,
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

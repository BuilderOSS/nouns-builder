import { UNISWAP_STATE_VIEW_ADDRESS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { type Address, parseAbi, type PublicClient } from 'viem'

// Uniswap V4 StateView ABI - just the function we need
export const UNISWAP_V4_STATE_VIEW_ABI = parseAbi([
  'function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
])

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SLOT0: 10_000, // 10 seconds for pool price data
  SUBGRAPH: 30_000, // 30 seconds for subgraph data
  USD_PRICE: 10_000, // 10 seconds for computed USD prices
  NULL_RESULT: 5_000, // 5 seconds for null results (negative cache)
} as const

// Cache entry type
export interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

/**
 * Get value from cache if not expired
 */
export function getCached<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string
): T | undefined {
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
export function setCached<T>(
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
export const SCALE = 10n ** 18n // 1e18 for fixed-point scaling
export const Q192 = 2n ** 192n // 2^192 for price math

/**
 * Safely convert a scaled bigint to a number
 * Splits into integer and fractional parts to avoid precision loss
 *
 * @param scaled - The scaled bigint value (scaled by SCALE = 1e18)
 * @returns The number representation, or null if value is too large
 */
export function scaledBigIntToNumber(scaled: bigint): number | null {
  const integer = scaled / SCALE
  const fraction = scaled % SCALE

  // Check if integer part is too large for safe conversion
  // Number.MAX_SAFE_INTEGER is 2^53 - 1 ≈ 9.007e15
  if (integer > BigInt(Number.MAX_SAFE_INTEGER)) {
    // Return null instead of throwing to prevent UI-breaking errors
    console.warn(
      `Price value too large for safe conversion: ${integer.toString()} (exceeds MAX_SAFE_INTEGER)`
    )
    return null
  }

  // Safe conversion: integer + fraction/1e18
  return Number(integer) + Number(fraction) / 1e18
}

/**
 * Calculate token price from sqrtPriceX96 using bigint-safe arithmetic
 * Assumes all tokens have 18 decimals
 *
 * Price calculation:
 * - rawPrice (token1 per token0) = (sqrtPriceX96^2) / 2^192
 * - We use fixed-point math with 1e18 scaling to maintain precision
 *
 * @param sqrtPriceX96 - The sqrt price from Uniswap V4 pool
 * @param isToken0 - Whether our token is token0 in the pool
 * @returns Price as a number (token per paired token), or null if conversion fails
 */
export function calculatePriceFromSqrtPriceX96(
  sqrtPriceX96: bigint,
  isToken0: boolean
): number | null {
  // Calculate (sqrtPriceX96^2 * SCALE) / 2^192
  // rawPrice in token1 per token0, scaled by 1e18
  const rawPriceScaled = (sqrtPriceX96 * sqrtPriceX96 * SCALE) / Q192

  // If our token is token1, we need to invert the price
  if (!isToken0) {
    if (rawPriceScaled === 0n) {
      console.warn('Cannot invert zero price')
      return null
    }
    // Use bigint inversion for precision: (SCALE * SCALE) / rawPriceScaled
    const invertedPriceScaled = (SCALE * SCALE) / rawPriceScaled
    return scaledBigIntToNumber(invertedPriceScaled)
  }

  return scaledBigIntToNumber(rawPriceScaled)
}

// Shared slot0 cache and in-flight deduplication (single instance across all price hooks)
export const slot0Cache = new Map<
  string,
  CacheEntry<readonly [bigint, number, number, number]>
>()
export const inflightSlot0 = new Map<
  string,
  Promise<readonly [bigint, number, number, number]>
>()

/**
 * Fetch slot0 data from StateView with caching and deduplication
 */
export async function fetchSlot0(
  poolId: `0x${string}`,
  chainId: CHAIN_ID,
  publicClient: PublicClient,
  signal?: AbortSignal
): Promise<readonly [bigint, number, number, number]> {
  const cacheKey = `${chainId}:${poolId}`

  // Check cache first
  const cached = getCached(slot0Cache, cacheKey)
  if (cached !== undefined) {
    return cached
  }

  // Check if already in-flight
  const inflight = inflightSlot0.get(cacheKey)
  if (inflight) {
    return inflight
  }

  // Start new request
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

      // Cache the result
      setCached(slot0Cache, cacheKey, result, CACHE_TTL.SLOT0)

      return result
    } finally {
      inflightSlot0.delete(cacheKey)
    }
  })()

  inflightSlot0.set(cacheKey, promise)
  return promise
}

// Shared USD price cache and in-flight deduplication (single instance across all price hooks)
export const usdPriceCache = new Map<string, CacheEntry<number | null>>()
export const inflightUsdPrice = new Map<string, Promise<number | null>>()

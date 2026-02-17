/**
 * Server-side coin price service
 *
 * Contains the pricing logic for ClankerTokens and ZoraCoins, designed for
 * use in Next.js API routes. Uses the same algorithms as the client-side hooks
 * but with server-managed caching.
 */

import { UNISWAP_STATE_VIEW_ADDRESS, WETH_ADDRESS } from '@buildeross/constants'
import { clankerTokenRequest, zoraCoinRequest } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import { type Address, getAddress, parseAbi, type PublicClient } from 'viem'

import { getRedisConnection } from './redisConnection'

// Uniswap V4 StateView ABI
const UNISWAP_V4_STATE_VIEW_ABI = parseAbi([
  'function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
])

// Cache TTL constants (in milliseconds) — server process cache
const CACHE_TTL = {
  SLOT0: 10_000,
  SUBGRAPH: 30_000,
  USD_PRICE: 10_000,
  ETH_USD: 30_000,
  NULL_RESULT: 5_000,
} as const

interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return undefined
  }
  return entry.value
}

function setCached<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  value: T,
  ttl: number
): void {
  cache.set(key, { value, timestamp: Date.now(), ttl })
}

// Server-side in-memory caches (shared across API route invocations in same process)
const slot0Cache = new Map<
  string,
  CacheEntry<readonly [bigint, number, number, number]>
>()
const clankerTokenCache = new Map<string, CacheEntry<any>>()
const zoraCoinCache = new Map<string, CacheEntry<any>>()
const usdPriceCache = new Map<string, CacheEntry<number | null>>()
const ethUsdCache = new Map<string, CacheEntry<number>>()

// In-flight deduplication
const inflightSlot0 = new Map<
  string,
  Promise<readonly [bigint, number, number, number]>
>()
const inflightUsdPrice = new Map<string, Promise<number | null>>()

// Bigint math constants
const SCALE = 10n ** 18n
const Q192 = 2n ** 192n

function scaledBigIntToNumber(scaled: bigint): number | null {
  const integer = scaled / SCALE
  const fraction = scaled % SCALE
  if (integer > BigInt(Number.MAX_SAFE_INTEGER)) {
    console.warn(`Price value too large for safe conversion: ${integer.toString()}`)
    return null
  }
  return Number(integer) + Number(fraction) / 1e18
}

function calculatePriceFromSqrtPriceX96(
  sqrtPriceX96: bigint,
  isToken0: boolean
): number | null {
  const rawPriceScaled = (sqrtPriceX96 * sqrtPriceX96 * SCALE) / Q192
  if (!isToken0) {
    if (rawPriceScaled === 0n) return null
    const invertedPriceScaled = (SCALE * SCALE) / rawPriceScaled
    return scaledBigIntToNumber(invertedPriceScaled)
  }
  return scaledBigIntToNumber(rawPriceScaled)
}

async function fetchSlot0(
  poolId: `0x${string}`,
  chainId: CHAIN_ID,
  publicClient: PublicClient
): Promise<readonly [bigint, number, number, number]> {
  const cacheKey = `${chainId}:${poolId}`

  const cached = getCached(slot0Cache, cacheKey)
  if (cached !== undefined) return cached

  const inflight = inflightSlot0.get(cacheKey)
  if (inflight) return inflight

  const promise = (async () => {
    try {
      const stateViewAddress =
        UNISWAP_STATE_VIEW_ADDRESS[chainId as keyof typeof UNISWAP_STATE_VIEW_ADDRESS]
      if (!stateViewAddress)
        throw new Error(`StateView not available for chain ${chainId}`)

      const result = await publicClient.readContract({
        address: stateViewAddress as Address,
        abi: UNISWAP_V4_STATE_VIEW_ABI,
        functionName: 'getSlot0',
        args: [poolId],
      })

      setCached(slot0Cache, cacheKey, result, CACHE_TTL.SLOT0)
      return result
    } finally {
      inflightSlot0.delete(cacheKey)
    }
  })()

  inflightSlot0.set(cacheKey, promise)
  return promise
}

const REDIS_ETH_USD_KEY = 'coins:eth-usd-price'
const REDIS_ETH_USD_TTL = 300 // 5 minutes

/**
 * Fetch the current ETH/USD price from Coinbase with layered caching:
 * 1. In-memory cache (30s, process-local)
 * 2. Redis cache (5min, shared across instances)
 * 3. Coinbase API
 * Falls back to a stale Redis value if Coinbase is unavailable.
 */
export async function fetchEthUsdPrice(): Promise<number> {
  const cacheKey = 'eth-usd'

  // Layer 1: in-memory cache
  const cached = getCached(ethUsdCache, cacheKey)
  if (cached !== undefined) return cached

  const redis = getRedisConnection()

  // Layer 2: Redis cache
  if (redis) {
    try {
      const redisValue = await redis.get(REDIS_ETH_USD_KEY)
      if (redisValue !== null) {
        const price = parseFloat(redisValue)
        if (!isNaN(price)) {
          setCached(ethUsdCache, cacheKey, price, CACHE_TTL.ETH_USD)
          return price
        }
      }
    } catch (redisErr) {
      console.warn('Redis unavailable when reading ETH/USD price:', redisErr)
    }
  }

  // Layer 3: Coinbase API
  try {
    const response = await fetch(
      'https://api.coinbase.com/v2/exchange-rates?currency=ETH'
    )
    if (!response.ok) throw new Error('Failed to fetch ETH/USD price')

    const json = await response.json()
    const priceString = json.data?.rates?.USD
    if (!priceString) throw new Error('USD rate not available for ETH')

    const price = parseFloat(priceString)
    if (isNaN(price)) throw new Error(`Invalid ETH/USD price: ${priceString}`)

    setCached(ethUsdCache, cacheKey, price, CACHE_TTL.ETH_USD)

    if (redis) {
      redis.setex(REDIS_ETH_USD_KEY, REDIS_ETH_USD_TTL, price.toString()).catch((err) => {
        console.warn('Failed to write ETH/USD price to Redis:', err)
      })
    }

    return price
  } catch (coinbaseErr) {
    // Coinbase failed — try serving stale Redis value as fallback
    if (redis) {
      try {
        const staleValue = await redis.get(REDIS_ETH_USD_KEY)
        if (staleValue !== null) {
          const stalePrice = parseFloat(staleValue)
          if (!isNaN(stalePrice)) {
            console.warn('Coinbase unavailable, serving stale ETH/USD price from Redis')
            setCached(ethUsdCache, cacheKey, stalePrice, CACHE_TTL.ETH_USD)
            return stalePrice
          }
        }
      } catch (redisFallbackErr) {
        console.warn(
          'Redis unavailable when reading stale ETH/USD price:',
          redisFallbackErr
        )
      }
    }

    throw coinbaseErr
  }
}

/**
 * Fetch ClankerToken from subgraph with server-side caching
 */
async function fetchClankerToken(tokenAddress: string, chainId: CHAIN_ID) {
  const normalizedAddress = getAddress(tokenAddress)
  const cacheKey = `${chainId}:${normalizedAddress}`

  const cached = getCached(clankerTokenCache, cacheKey)
  if (cached !== undefined) return cached

  const result = await clankerTokenRequest(normalizedAddress as AddressType, chainId)
  const ttl = result ? CACHE_TTL.SUBGRAPH : CACHE_TTL.NULL_RESULT
  setCached(clankerTokenCache, cacheKey, result, ttl)
  return result
}

/**
 * Fetch ZoraCoin from subgraph with server-side caching
 */
async function fetchZoraCoin(coinAddress: string, chainId: CHAIN_ID) {
  const normalizedAddress = getAddress(coinAddress)
  const cacheKey = `${chainId}:${normalizedAddress}`

  const cached = getCached(zoraCoinCache, cacheKey)
  if (cached !== undefined) return cached

  const result = await zoraCoinRequest(normalizedAddress as AddressType, chainId)
  const ttl = result ? CACHE_TTL.SUBGRAPH : CACHE_TTL.NULL_RESULT
  setCached(zoraCoinCache, cacheKey, result, ttl)
  return result
}

/**
 * Recursively fetch the USD price of a ClankerToken
 * Mirrors the logic in packages/hooks/src/useClankerTokenPrice.ts
 */
async function fetchClankerTokenUsdPriceInternal(
  tokenAddress: string,
  chainId: CHAIN_ID,
  publicClient: PublicClient,
  ethUsdPrice: number,
  depth: number
): Promise<number | null> {
  const normalizedAddress = getAddress(tokenAddress)

  // Base case: WETH
  const wethAddress = WETH_ADDRESS[chainId as keyof typeof WETH_ADDRESS]
  if (wethAddress && normalizedAddress === getAddress(wethAddress)) {
    return ethUsdPrice
  }

  if (depth > 2) return null

  const cacheKey = `${chainId}:${normalizedAddress}`

  const cached = getCached(usdPriceCache, cacheKey)
  if (cached !== undefined) return cached

  const inflight = inflightUsdPrice.get(cacheKey)
  if (inflight) return inflight

  const computePrice = async (): Promise<number | null> => {
    try {
      const clankerToken = await fetchClankerToken(normalizedAddress, chainId)
      if (!clankerToken) {
        setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
        return null
      }

      const slot0Result = await fetchSlot0(
        clankerToken.poolId as `0x${string}`,
        chainId,
        publicClient
      )

      const sqrtPriceX96 = slot0Result[0]
      const pairedTokenAddress = getAddress(clankerToken.pairedToken)
      const isToken0 = normalizedAddress.toLowerCase() < pairedTokenAddress.toLowerCase()
      const priceInPairedToken = calculatePriceFromSqrtPriceX96(sqrtPriceX96, isToken0)

      if (priceInPairedToken === null) {
        setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
        return null
      }

      const pairedTokenUsdPrice = await fetchClankerTokenUsdPriceInternal(
        pairedTokenAddress,
        chainId,
        publicClient,
        ethUsdPrice,
        depth + 1
      )

      if (pairedTokenUsdPrice === null) {
        setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
        return null
      }

      const usdPrice = priceInPairedToken * pairedTokenUsdPrice
      setCached(usdPriceCache, cacheKey, usdPrice, CACHE_TTL.USD_PRICE)
      return usdPrice
    } catch (err) {
      console.error(`Error fetching price for token ${normalizedAddress}:`, err)
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

/**
 * Get the USD price of a ClankerToken (server-side, for use in API routes)
 * @param ethUsdPrice - Optional ETH/USD price supplied by the client. If omitted,
 *                      the price is fetched from Coinbase (with Redis caching).
 */
export async function getClankerTokenUsdPrice(
  tokenAddress: string,
  chainId: CHAIN_ID,
  ethUsdPrice?: number
): Promise<number | null> {
  const publicClient = getProvider(chainId)
  const resolvedEthUsdPrice = ethUsdPrice ?? (await fetchEthUsdPrice())
  return fetchClankerTokenUsdPriceInternal(
    tokenAddress,
    chainId,
    publicClient,
    resolvedEthUsdPrice,
    0
  )
}

/**
 * Get the USD price of a ZoraCoin (server-side, for use in API routes)
 * ZoraCoins are always paired with ClankerTokens (via currency field)
 * @param ethUsdPrice - Optional ETH/USD price supplied by the client. If omitted,
 *                      the price is fetched from Coinbase (with Redis caching).
 */
export async function getZoraCoinUsdPrice(
  coinAddress: string,
  chainId: CHAIN_ID,
  ethUsdPrice?: number
): Promise<number | null> {
  const publicClient = getProvider(chainId)
  const resolvedEthUsdPrice = ethUsdPrice ?? (await fetchEthUsdPrice())

  const normalizedAddress = getAddress(coinAddress)
  const cacheKey = `zora:${chainId}:${normalizedAddress}`

  const cached = getCached(usdPriceCache, cacheKey)
  if (cached !== undefined) return cached

  try {
    const zoraCoin = await fetchZoraCoin(normalizedAddress, chainId)
    if (!zoraCoin || !zoraCoin.poolKeyHash || !zoraCoin.currency) {
      setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
      return null
    }

    const slot0Result = await fetchSlot0(
      zoraCoin.poolKeyHash as `0x${string}`,
      chainId,
      publicClient
    )

    const sqrtPriceX96 = slot0Result[0]
    const currencyAddress = getAddress(zoraCoin.currency)
    const isToken0 = normalizedAddress.toLowerCase() < currencyAddress.toLowerCase()
    const priceInCurrency = calculatePriceFromSqrtPriceX96(sqrtPriceX96, isToken0)

    if (priceInCurrency === null) {
      setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
      return null
    }

    const currencyUsdPrice = await fetchClankerTokenUsdPriceInternal(
      currencyAddress,
      chainId,
      publicClient,
      resolvedEthUsdPrice,
      0
    )

    if (currencyUsdPrice === null) {
      setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
      return null
    }

    const usdPrice = priceInCurrency * currencyUsdPrice
    setCached(usdPriceCache, cacheKey, usdPrice, CACHE_TTL.USD_PRICE)
    return usdPrice
  } catch (err) {
    console.error(`Error fetching price for ZoraCoin ${normalizedAddress}:`, err)
    setCached(usdPriceCache, cacheKey, null, CACHE_TTL.NULL_RESULT)
    return null
  }
}

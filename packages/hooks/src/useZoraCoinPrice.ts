import { type ZoraCoinFragment, zoraCoinRequest } from '@buildeross/sdk/subgraph'
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
import { fetchClankerTokenUsdPrice } from './useClankerTokenPrice'
import { useEthUsdPrice } from './useEthUsdPrice'

// ZoraCoin-specific caches
const zoraCoinCache = new Map<string, CacheEntry<ZoraCoinFragment | null>>()
const inflightZoraCoin = new Map<string, Promise<ZoraCoinFragment | null>>()

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

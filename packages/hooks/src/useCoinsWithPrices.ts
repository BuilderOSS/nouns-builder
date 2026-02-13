import {
  type ClankerTokenFragment,
  type ZoraCoinFragment,
} from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { DEFAULT_CLANKER_TOTAL_SUPPLY } from '@buildeross/utils/poolConfig/clankerCreator'
import { DEFAULT_ZORA_TOTAL_SUPPLY } from '@buildeross/utils/poolConfig/zoraContent'
import { useMemo } from 'react'

import { useClankerTokenPrice } from './useClankerTokenPrice'
import { useZoraCoinPrice } from './useZoraCoinPrice'

export interface CoinWithPrice {
  priceUsd: number | null
  marketCap: number | null
  isLoadingPrice: boolean
}

/**
 * Enrich a single Clanker token with price and market cap data
 */
export const useClankerTokenWithPrice = ({
  clankerToken,
  chainId,
  enabled = true,
}: {
  clankerToken?: ClankerTokenFragment | null
  chainId: CHAIN_ID
  enabled?: boolean
}): ClankerTokenFragment & CoinWithPrice => {
  const { priceUsd, isLoading } = useClankerTokenPrice({
    clankerToken,
    chainId,
    enabled,
  })

  const enrichedToken = useMemo(() => {
    const marketCap =
      priceUsd !== null && Number.isFinite(priceUsd)
        ? priceUsd * DEFAULT_CLANKER_TOTAL_SUPPLY
        : null

    return {
      ...(clankerToken || {}),
      priceUsd,
      marketCap,
      isLoadingPrice: isLoading,
    } as ClankerTokenFragment & CoinWithPrice
  }, [clankerToken, priceUsd, isLoading])

  return enrichedToken
}

/**
 * Enrich a single Zora coin with price and market cap data
 */
export const useZoraCoinWithPrice = ({
  zoraCoin,
  chainId,
  enabled = true,
}: {
  zoraCoin?: ZoraCoinFragment | null
  chainId: CHAIN_ID
  enabled?: boolean
}): ZoraCoinFragment & CoinWithPrice => {
  const { priceUsd, isLoading } = useZoraCoinPrice({
    zoraCoin,
    chainId,
    enabled,
  })

  const enrichedCoin = useMemo(() => {
    const marketCap =
      priceUsd !== null && Number.isFinite(priceUsd)
        ? priceUsd * DEFAULT_ZORA_TOTAL_SUPPLY
        : null

    return {
      ...(zoraCoin || {}),
      priceUsd,
      marketCap,
      isLoadingPrice: isLoading,
    } as ZoraCoinFragment & CoinWithPrice
  }, [zoraCoin, priceUsd, isLoading])

  return enrichedCoin
}

/**
 * Enrich multiple Zora coins with price and market cap data
 * Note: This hook returns coins with null price data as placeholders.
 * Individual components should use useZoraCoinWithPrice to fetch prices.
 */
export const useZoraCoinsWithPrices = ({
  zoraCoins,
  _chainId,
  _enabled = true,
}: {
  zoraCoins?: ZoraCoinFragment[]
  _chainId: CHAIN_ID
  _enabled?: boolean
}): (ZoraCoinFragment & CoinWithPrice)[] => {
  // Create a stable array reference to avoid infinite loops
  const stableCoins = useMemo(() => zoraCoins || [], [zoraCoins])

  // We can't use hooks in a loop, so individual components use useZoraCoinWithPrice
  // This function just adds the CoinWithPrice shape with null values
  const enrichedCoins = useMemo(() => {
    return stableCoins.map((coin) => {
      return {
        ...coin,
        priceUsd: null,
        marketCap: null,
        isLoadingPrice: true,
      } as ZoraCoinFragment & CoinWithPrice
    })
  }, [stableCoins])

  return enrichedCoins
}

import {
  type ClankerTokenCardFragment,
  type ZoraCoinCardFragment,
} from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { DEFAULT_CLANKER_TOTAL_SUPPLY } from '@buildeross/utils/coining/clankerCreator'
import { DEFAULT_ZORA_TOTAL_SUPPLY } from '@buildeross/utils/coining/zoraContent'
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
  clankerToken?: ClankerTokenCardFragment | null
  chainId: CHAIN_ID
  enabled?: boolean
}): ClankerTokenCardFragment & CoinWithPrice => {
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
    } as ClankerTokenCardFragment & CoinWithPrice
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
  zoraCoin?: ZoraCoinCardFragment | null
  chainId: CHAIN_ID
  enabled?: boolean
}): ZoraCoinCardFragment & CoinWithPrice => {
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
    } as ZoraCoinCardFragment & CoinWithPrice
  }, [zoraCoin, priceUsd, isLoading])

  return enrichedCoin
}

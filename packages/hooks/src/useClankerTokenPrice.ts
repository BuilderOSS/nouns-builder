import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { type ClankerTokenFragment } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { isCoinSupportedChain } from '@buildeross/utils/helpers'
import useSWR from 'swr'

import { useEthUsdPrice } from './useEthUsdPrice'

async function fetchClankerTokenPrice(
  chainId: CHAIN_ID,
  tokenAddress: string,
  ethUsdPrice: number
): Promise<number | null> {
  const params = new URLSearchParams()
  params.set('chainId', chainId.toString())
  params.set('tokenAddress', tokenAddress)
  params.set('ethUsdPrice', ethUsdPrice.toString())

  const response = await fetch(
    `${BASE_URL}/api/coins/clanker-token-price?${params.toString()}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch clanker token price')
  }
  const result = await response.json()
  return result.priceUsd ?? null
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
  const tokenAddress = clankerToken?.tokenAddress
  const { price: ethUsdPrice } = useEthUsdPrice()

  const { data, isLoading, error } = useSWR(
    enabled && tokenAddress && isCoinSupportedChain(chainId) && ethUsdPrice !== undefined
      ? ([SWR_KEYS.CLANKER_TOKEN_PRICE, chainId, tokenAddress, ethUsdPrice] as const)
      : null,
    async ([, _chainId, _tokenAddress, _ethUsdPrice]) =>
      fetchClankerTokenPrice(_chainId, _tokenAddress, _ethUsdPrice),
    {
      refreshInterval: 10_000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    priceUsd: data ?? null,
    isLoading,
    error: error ?? null,
  }
}

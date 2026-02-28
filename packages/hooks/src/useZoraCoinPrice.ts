import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { type ZoraCoinFragment } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import useSWR from 'swr'

import { useEthUsdPrice } from './useEthUsdPrice'

async function fetchZoraCoinPrice(
  chainId: CHAIN_ID,
  coinAddress: string,
  ethUsdPrice: number
): Promise<number | null> {
  const params = new URLSearchParams()
  params.set('chainId', chainId.toString())
  params.set('coinAddress', coinAddress)
  params.set('ethUsdPrice', ethUsdPrice.toString())

  const response = await fetch(
    `${BASE_URL}/api/coins/zora-coin-price?${params.toString()}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch zora coin price')
  }
  const result = await response.json()
  return result.priceUsd ?? null
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
  const coinAddress = zoraCoin?.coinAddress
  const { price: ethUsdPrice } = useEthUsdPrice()

  const { data, isLoading, error } = useSWR(
    enabled &&
      coinAddress &&
      isChainIdSupportedByCoining(chainId) &&
      ethUsdPrice !== undefined
      ? ([SWR_KEYS.ZORA_COIN_PRICE, chainId, coinAddress, ethUsdPrice] as const)
      : null,
    async ([, _chainId, _coinAddress, _ethUsdPrice]) =>
      fetchZoraCoinPrice(_chainId, _coinAddress, _ethUsdPrice),
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

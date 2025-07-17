import { CHAIN_ID } from '@buildeross/types'
import useSWR from 'swr'
import { Address, isAddress } from 'viem'

import SWR_KEYS from 'src/constants/swrKeys'

export type TokenBalance = {
  address: string
  balance: string // serialized bigint
  name: string
  symbol: string
  decimals: number
  logo: string
  price: string
  valueInUSD: string
}

export type TokenBalancesReturnType = {
  balances: undefined | TokenBalance[]
  isLoading: boolean
  error?: Error | null
}

const fetchTokenBalances = async (
  chainId: CHAIN_ID,
  address: Address
): Promise<TokenBalance[]> => {
  const response = await fetch(
    `/api/token-balances?chainId=${chainId}&address=${address}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch token balances')
  }
  const result = await response.json()
  return result.data || []
}

export const useTokenBalances = (
  chainId?: CHAIN_ID,
  address?: Address
): TokenBalancesReturnType => {
  const { data, error, isLoading } = useSWR(
    !!address && !!chainId && isAddress(address)
      ? [SWR_KEYS.TOKEN_BALANCES, chainId, address]
      : null,
    async () => fetchTokenBalances(chainId as CHAIN_ID, address as Address),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    balances: data,
    isLoading,
    error,
  }
}

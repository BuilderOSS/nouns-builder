import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { CHAIN_ID } from '@buildeross/types'
import useSWR, { KeyedMutator } from 'swr'
import { Address, isAddress } from 'viem'

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
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<TokenBalance[]>
}

const fetchTokenBalances = async (
  chainId: CHAIN_ID,
  address: Address
): Promise<TokenBalance[]> => {
  const response = await fetch(
    `${BASE_URL}/api/token-balances?chainId=${chainId}&address=${address}`
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
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!address && !!chainId && isAddress(address)
      ? ([SWR_KEYS.TOKEN_BALANCES, chainId, address] as const)
      : null,
    async ([, _chainId, _address]) =>
      fetchTokenBalances(_chainId as CHAIN_ID, _address as Address),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    balances: data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}

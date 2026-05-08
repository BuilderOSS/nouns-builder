import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'
import { type Address, isAddress } from 'viem'

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
  address: Address,
  filterLowValue?: boolean
): Promise<TokenBalance[]> => {
  const params = new URLSearchParams()
  params.set('chainId', chainId.toString())
  params.set('address', address)
  if (typeof filterLowValue === 'boolean') {
    params.set('filterLowValue', String(filterLowValue))
  }

  const response = await fetch(
    `${BASE_URL}/api/alchemy/token-balances?${params.toString()}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch token balances')
  }
  const result = await response.json()
  return result.data || []
}

export const useTokenBalances = (
  chainId?: CHAIN_ID,
  address?: Address,
  options?: {
    filterLowValue?: boolean
  }
): TokenBalancesReturnType => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!address && !!chainId && isAddress(address)
      ? ([SWR_KEYS.TOKEN_BALANCES, chainId, address, options?.filterLowValue] as const)
      : null,
    async ([, _chainId, _address, _filterLowValue]) =>
      fetchTokenBalances(
        _chainId as CHAIN_ID,
        _address as Address,
        _filterLowValue as boolean | undefined
      ),
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

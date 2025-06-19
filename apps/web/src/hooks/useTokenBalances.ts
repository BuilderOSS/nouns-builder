import useSWR from 'swr'
import { Address, formatUnits, isAddress } from 'viem'

import SWR_KEYS from 'src/constants/swrKeys'
import { CHAIN_ID } from 'src/typings'
import {
  TokenBalance as InnerTokenBalance,
  TokenMetadata,
  TokenPrice,
  getTokenBalances,
  getTokenMetadatas,
  getTokenPrices,
} from 'src/utils/alchemy'

export type TokenBalance = InnerTokenBalance &
  TokenMetadata &
  TokenPrice & { valueInUSD: string }

export type TokenBalancesReturnType = {
  balances: undefined | TokenBalance[]
  isLoading: boolean
  error?: Error | null
}

const MINIMUM_USD_VALUE = 0.01
const SYMBOL_REGEX = /^[a-zA-Z0-9]+$/

const getTokenBalancesWithMetadata = async (
  chainId: CHAIN_ID,
  address: Address
): Promise<TokenBalancesReturnType['balances']> => {
  const balances = await getTokenBalances(chainId, address)
  if (!balances) {
    return []
  }
  const metadatas = await getTokenMetadatas(
    chainId,
    balances.map((balance) => balance.address)
  )
  if (!metadatas) {
    return []
  }

  const symbols = metadatas
    .map((metadata) => metadata.symbol.trim())
    .filter((symbol) => SYMBOL_REGEX.test(symbol))
  if (!symbols.length) {
    return []
  }
  const prices = await getTokenPrices(chainId, symbols)
  if (!prices) {
    return []
  }

  const all = prices.map((price) => {
    const metadata = metadatas.find(
      (metadata) => metadata.symbol.trim() === price.symbol
    )!
    const balance = balances.find(
      (balance) => balance.address.toLowerCase() === metadata.address.toLowerCase()
    )!
    const amount = parseFloat(formatUnits(balance.balance, metadata.decimals))
    return {
      ...balance,
      ...metadata,
      ...price,
      valueInUSD: (amount * parseFloat(price.price)).toFixed(2),
    }
  })

  return all.filter((balance) => parseFloat(balance.valueInUSD) >= MINIMUM_USD_VALUE)
}

export const useTokenBalances = (
  chainId?: CHAIN_ID,
  address?: Address
): TokenBalancesReturnType => {
  const { data, error, isLoading } = useSWR(
    !!address && !!chainId && isAddress(address)
      ? [SWR_KEYS.TOKEN_BALANCES, chainId, address]
      : null,
    async () =>
      getTokenBalancesWithMetadata(chainId as CHAIN_ID, address as `0x${string}`),
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

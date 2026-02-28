import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import useSWR, { type KeyedMutator } from 'swr'

export type CurrencyUsdPriceReturnType =
  | {
      price: number
      isValidating: boolean
      isLoading: false
      error: undefined
      mutate: KeyedMutator<number>
    }
  | {
      price: undefined
      isValidating: boolean
      isLoading: true
      error: undefined
      mutate: KeyedMutator<number>
    }
  | {
      price: undefined
      isValidating: boolean
      isLoading: boolean
      error: Error
      mutate: KeyedMutator<number>
    }

const fetchCurrencyUsdPrice = async (currency: string): Promise<number> => {
  const response = await fetch(
    `https://api.coinbase.com/v2/exchange-rates?currency=${currency}`
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch ${currency}/USD price`)
  }
  const json = await response.json()

  // Validate that USD rate exists in the response
  if (!json.data?.rates?.USD) {
    throw new Error(
      `USD rate not available for currency: ${currency}. Currency may not be supported by Coinbase.`
    )
  }

  const priceString = json.data.rates.USD
  const price = parseFloat(priceString)

  // Validate that the parsed price is a valid number
  if (isNaN(price)) {
    throw new Error(`Invalid price value received for ${currency}/USD: ${priceString}`)
  }

  return price
}

/**
 * Hook to fetch the current currency/USD exchange rate from Coinbase API
 *
 * @param currency - The currency code (e.g., 'ETH', 'ZORA', 'BTC'). Defaults to 'ETH'.
 * @returns An object with the currency/USD price, loading states, error, and mutate function
 */
export const useCurrencyUsdPrice = (
  currency: string = 'ETH'
): CurrencyUsdPriceReturnType => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    [SWR_KEYS.ETH_USD, currency],
    async ([, _currency]) => fetchCurrencyUsdPrice(_currency),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000, // Refresh every 60 seconds
    }
  )

  if (error) {
    return {
      price: undefined,
      isLoading,
      isValidating,
      error,
      mutate,
    }
  }

  if (isLoading) {
    return {
      price: undefined,
      isLoading,
      isValidating,
      error: undefined,
      mutate,
    }
  }

  return {
    price: data!,
    isLoading,
    isValidating,
    error: undefined,
    mutate,
  }
}

/**
 * Hook to fetch the current ETH/USD exchange rate from Coinbase API
 * This is a convenience wrapper around useCurrencyUsdPrice for backwards compatibility
 *
 * @returns An object with the ETH/USD price, loading states, error, and mutate function
 */
export const useEthUsdPrice = (): CurrencyUsdPriceReturnType => {
  return useCurrencyUsdPrice('ETH')
}

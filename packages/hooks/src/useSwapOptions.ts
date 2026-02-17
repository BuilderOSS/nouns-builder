import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { SwapOption as SwapOptionType } from '@buildeross/swap'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { isCoinSupportedChain } from '@buildeross/utils/helpers'
import useSWR from 'swr'

// Re-export SwapOption type from swap package
export type SwapOption = SwapOptionType

export interface UseSwapOptionsResult {
  options: SwapOption[]
  isLoading: boolean
  error: Error | null
}

/**
 * Deserialize swap options from the API response.
 * The API serializes bigint fields (fee, estimatedGas) as strings.
 */
function deserializeSwapOptions(data: any): SwapOption[] {
  if (!Array.isArray(data?.options)) return []
  return data.options.map((opt: any) => ({
    ...opt,
    token: {
      ...opt.token,
      fee: opt.token.fee !== undefined ? BigInt(opt.token.fee) : undefined,
    },
    path: {
      ...opt.path,
      hops: (opt.path.hops ?? []).map((hop: any) => ({
        ...hop,
        fee: hop.fee !== undefined ? BigInt(hop.fee) : undefined,
      })),
      estimatedGas:
        opt.path.estimatedGas !== undefined ? BigInt(opt.path.estimatedGas) : undefined,
    },
  }))
}

async function fetchSwapOptions(
  chainId: CHAIN_ID,
  coinAddress: string,
  isBuying: boolean
): Promise<SwapOption[]> {
  const params = new URLSearchParams()
  params.set('chainId', chainId.toString())
  params.set('coinAddress', coinAddress)
  params.set('isBuying', isBuying.toString())

  const response = await fetch(`${BASE_URL}/api/coins/swap-options?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch swap options')
  }
  const result = await response.json()
  return deserializeSwapOptions(result)
}

/**
 * Fetches all available payment tokens for swapping with a specific coin.
 * Returns ETH, WETH, and any intermediate tokens discovered in the swap path.
 * Each option includes the token info and the swap path from that token to the coin.
 */
export function useSwapOptions(
  chainId: CHAIN_ID,
  coinAddress: AddressType,
  isBuying: boolean = true
): UseSwapOptionsResult {
  const { data, isLoading, error } = useSWR(
    coinAddress && isCoinSupportedChain(chainId)
      ? ([SWR_KEYS.SWAP_OPTIONS, chainId, coinAddress, isBuying] as const)
      : null,
    async ([, _chainId, _coinAddress, _isBuying]) =>
      fetchSwapOptions(_chainId, _coinAddress, _isBuying),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    options: data ?? [],
    isLoading,
    error: error ?? null,
  }
}

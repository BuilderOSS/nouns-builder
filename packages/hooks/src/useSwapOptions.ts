import { NATIVE_TOKEN_ADDRESS, WETH_ADDRESS } from '@buildeross/constants/addresses'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { type SwapRouteFragment, swapRouteRequest } from '@buildeross/sdk/subgraph'
import { CoinInfo, SwapOption as SwapOptionType, SwapPath } from '@buildeross/swap'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import useSWR from 'swr'

export type SwapOption = SwapOptionType

export interface UseSwapOptionsResult {
  options: SwapOption[]
  isLoading: boolean
  error: Error | null
}

type Hop = {
  tokenIn: AddressType
  tokenOut: AddressType
  poolId: AddressType
  fee?: bigint
  hooks?: AddressType
  tickSpacing?: number
}

/**
 * Subgraph mainPath is stored as: COIN -> PAYMENT TOKEN (SELL direction)
 * If isBuying=true, we must invert to get PAYMENT -> COIN.
 */
function normalizeHopsForTradeDirection(
  relevantHops: SwapRouteFragment['mainPath'],
  isBuying: boolean
): Hop[] {
  if (!isBuying) {
    // Selling: Coin -> Payment (as stored)
    return relevantHops.map((hop) => ({
      tokenIn: hop.tokenIn as AddressType,
      tokenOut: hop.tokenOut as AddressType,
      poolId: hop.poolId as AddressType,
      fee: hop.fee ? BigInt(hop.fee) : undefined,
      hooks: hop.hooks as AddressType | undefined,
      tickSpacing: hop.tickSpacing ?? undefined,
    }))
  }

  // Buying: Payment -> Coin (invert)
  return [...relevantHops].reverse().map((hop) => ({
    tokenIn: hop.tokenOut as AddressType,
    tokenOut: hop.tokenIn as AddressType,
    poolId: hop.poolId as AddressType,
    fee: hop.fee ? BigInt(hop.fee) : undefined,
    hooks: hop.hooks as AddressType | undefined,
    tickSpacing: hop.tickSpacing ?? undefined,
  }))
}

function convertCoinType(
  coinType: string
): 'eth' | 'weth' | 'zora-coin' | 'clanker-token' {
  switch (coinType) {
    case 'WETH':
      return 'weth'
    case 'CLANKER_TOKEN':
      return 'clanker-token'
    case 'ZORA_COIN':
      return 'zora-coin'
    default:
      return 'weth' // fallback
  }
}

export function convertSwapRouteToOptions(
  swapRoute: SwapRouteFragment,
  isBuying: boolean,
  chainId: CHAIN_ID
): SwapOption[] {
  const paymentOptions = swapRoute.paymentOptions ?? []
  if (paymentOptions.length === 0) return []

  const tokenDetailsMap = new Map<string, { symbol: string; name: string }>()

  // Target token metadata (if present)
  if (swapRoute.clankerToken) {
    tokenDetailsMap.set(swapRoute.clankerToken.tokenAddress.toLowerCase(), {
      symbol: swapRoute.clankerToken.tokenSymbol,
      name: swapRoute.clankerToken.tokenName,
    })
  }
  if (swapRoute.zoraCoin) {
    tokenDetailsMap.set(swapRoute.zoraCoin.coinAddress.toLowerCase(), {
      symbol: swapRoute.zoraCoin.symbol,
      name: swapRoute.zoraCoin.name,
    })
  }

  // WETH metadata
  const wethAddress = WETH_ADDRESS[chainId]
  if (wethAddress) {
    tokenDetailsMap.set(wethAddress.toLowerCase(), {
      symbol: 'WETH',
      name: 'Wrapped Ether',
    })
  }

  // Payment options metadata from subgraph
  paymentOptions.forEach((paymentOption) => {
    tokenDetailsMap.set(paymentOption.tokenAddress.toLowerCase(), {
      symbol: paymentOption.tokenSymbol,
      name: paymentOption.tokenName,
    })
  })

  const options: SwapOption[] = []

  // Build options from paymentOptions
  for (const paymentOption of paymentOptions) {
    const relevantHops = swapRoute.mainPath.slice(
      paymentOption.startHopIndex,
      paymentOption.endHopIndex + 1
    )

    const hops = normalizeHopsForTradeDirection(relevantHops, isBuying)

    const path: SwapPath = {
      hops,
      isOptimal: true,
      estimatedGas: undefined,
    }

    const tokenAddress = paymentOption.tokenAddress as AddressType
    const tokenDetails = tokenDetailsMap.get(tokenAddress.toLowerCase()) ?? {
      symbol: 'TOKEN',
      name: 'Token',
    }

    const tokenInfo: CoinInfo = {
      address: tokenAddress,
      symbol: tokenDetails.symbol,
      name: tokenDetails.name,
      type: convertCoinType(paymentOption.tokenType),
    } as CoinInfo

    options.push({
      token: tokenInfo,
      path,
      isDirectSwap: paymentOption.isDirectSwap,
    })
  }

  // Add ETH option based on the WETH option (same hops), but token is native ETH
  const wethOpt = paymentOptions.find((opt) => {
    const addr = (opt.tokenAddress as string)?.toLowerCase()
    return wethAddress && addr === wethAddress.toLowerCase()
  })

  if (wethOpt) {
    const relevantHops = swapRoute.mainPath.slice(
      wethOpt.startHopIndex,
      wethOpt.endHopIndex + 1
    )
    const hops = normalizeHopsForTradeDirection(relevantHops, isBuying)

    const ethPath: SwapPath = {
      hops,
      isOptimal: true,
      estimatedGas: undefined,
    }

    const ethInfo: CoinInfo = {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'eth',
    } as CoinInfo

    options.unshift({
      token: ethInfo,
      path: ethPath,
      isDirectSwap: wethOpt.isDirectSwap,
    })
  }

  return options
}

async function fetchSwapOptions(
  chainId: CHAIN_ID,
  coinAddress: string,
  isBuying: boolean
): Promise<SwapOption[]> {
  const swapRoute = await swapRouteRequest(coinAddress, chainId)

  if (!swapRoute) {
    return []
  }

  return convertSwapRouteToOptions(swapRoute, isBuying, chainId)
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
    coinAddress && isChainIdSupportedByCoining(chainId)
      ? ([SWR_KEYS.SWAP_OPTIONS, chainId, coinAddress, isBuying] as const)
      : null,
    async ([, _chainId, _coinAddress, _isBuying]) =>
      fetchSwapOptions(_chainId, _coinAddress, _isBuying),
    {
      refreshInterval: 60_000,
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

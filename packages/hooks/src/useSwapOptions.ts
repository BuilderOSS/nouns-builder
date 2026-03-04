import { NATIVE_TOKEN_ADDRESS, WETH_ADDRESS } from '@buildeross/constants/addresses'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { type SwapRouteFragment, swapRouteRequest } from '@buildeross/sdk/subgraph'
import type { SwapOption as SwapOptionType, SwapPath, TokenInfo } from '@buildeross/swap'
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
): 'eth' | 'weth' | 'zora-coin' | 'clanker-token' | undefined {
  switch (coinType) {
    case 'ETH':
      return 'eth'
    case 'WETH':
      return 'weth'
    case 'CLANKER_TOKEN':
      return 'clanker-token'
    case 'ZORA_COIN':
      return 'zora-coin'
    case 'UNKNOWN':
      return undefined
    default:
      return undefined
  }
}

function sanitizeHopRange(
  startHopIndex: number,
  endHopIndex: number,
  pathLength: number,
  label: string
): { start: number; end: number } | null {
  if (pathLength <= 0) {
    console.warn(`[useSwapOptions] Skipping ${label}: mainPath is empty`)
    return null
  }

  const originalStart = startHopIndex
  const originalEnd = endHopIndex

  if (!Number.isInteger(startHopIndex) || !Number.isInteger(endHopIndex)) {
    console.warn(
      `[useSwapOptions] Non-integer hop indices for ${label}: start=${startHopIndex}, end=${endHopIndex}`
    )
  }

  if (!Number.isFinite(startHopIndex) || !Number.isFinite(endHopIndex)) {
    console.warn(
      `[useSwapOptions] Skipping ${label}: non-finite hop indices start=${startHopIndex}, end=${endHopIndex}`
    )
    return null
  }

  const maxIndex = pathLength - 1
  const start = Math.min(Math.max(Math.trunc(startHopIndex), 0), maxIndex)
  const end = Math.min(Math.max(Math.trunc(endHopIndex), 0), maxIndex)

  if (start !== originalStart || end !== originalEnd) {
    console.warn(
      `[useSwapOptions] Clamped hop indices for ${label}: start=${originalStart}->${start}, end=${originalEnd}->${end}, pathLength=${pathLength}`
    )
  }

  if (start > end) {
    console.warn(
      `[useSwapOptions] Skipping ${label}: invalid hop range start=${start}, end=${end}`
    )
    return null
  }

  return { start, end }
}

function addrEq(a?: string, b?: string): boolean {
  if (!a || !b) return false
  return a.toLowerCase() === b.toLowerCase()
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
    const hopRange = sanitizeHopRange(
      paymentOption.startHopIndex,
      paymentOption.endHopIndex,
      swapRoute.mainPath.length,
      `payment option ${paymentOption.tokenAddress}`
    )
    if (!hopRange) continue

    const relevantHops = swapRoute.mainPath.slice(hopRange.start, hopRange.end + 1)
    if (relevantHops.length === 0) {
      console.warn(
        `[useSwapOptions] Skipping payment option ${paymentOption.tokenAddress}: no hops in sanitized range`
      )
      continue
    }

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

    const tokenType = convertCoinType(paymentOption.tokenType)
    if (!tokenType) {
      console.warn(
        `[useSwapOptions] Skipping payment option ${paymentOption.tokenAddress}: unsupported tokenType ${paymentOption.tokenType}`
      )
      continue
    }

    const tokenInfo: TokenInfo = {
      address: tokenAddress,
      symbol: tokenDetails.symbol,
      name: tokenDetails.name,
      type: tokenType,
    }

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
    const hopRange = sanitizeHopRange(
      wethOpt.startHopIndex,
      wethOpt.endHopIndex,
      swapRoute.mainPath.length,
      `WETH payment option ${wethOpt.tokenAddress}`
    )
    if (!hopRange) {
      return options
    }

    const relevantHops = swapRoute.mainPath.slice(hopRange.start, hopRange.end + 1)
    if (relevantHops.length === 0) {
      console.warn('[useSwapOptions] Skipping ETH option: WETH path has no hops in range')
      return options
    }

    const hops = normalizeHopsForTradeDirection(relevantHops, isBuying)

    // If user selected ETH (not WETH), preserve native currency in displayed path.
    if (hops.length > 0 && wethAddress) {
      if (isBuying) {
        const firstHop = hops[0]
        if (addrEq(firstHop.tokenIn, wethAddress)) {
          hops[0] = { ...firstHop, tokenIn: NATIVE_TOKEN_ADDRESS }
        }
      } else {
        const lastHop = hops[hops.length - 1]
        if (addrEq(lastHop.tokenOut, wethAddress)) {
          hops[hops.length - 1] = { ...lastHop, tokenOut: NATIVE_TOKEN_ADDRESS }
        }
      }
    }

    const ethPath: SwapPath = {
      hops,
      isOptimal: true,
      estimatedGas: undefined,
    }

    const ethInfo: TokenInfo = {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'eth',
    }

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

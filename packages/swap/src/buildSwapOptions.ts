import { NATIVE_TOKEN_ADDRESS, WETH_ADDRESS } from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

import { buildSwapPath } from './buildSwapPath'
import { getCoinInfo } from './getCoinInfo'
import { CoinInfo, SwapPath } from './types'

export interface SwapOption {
  /** Token info including address, symbol, and type */
  token: CoinInfo
  /** Swap path for this token <-> coin */
  path: SwapPath
  /** True if this is a direct swap (single hop or no hop) */
  isDirectSwap: boolean
}

export interface BuildSwapOptionsResult {
  /** All available swap options */
  options: SwapOption[]
  /** The main path used to discover options (coin <-> WETH) */
  mainPath: SwapPath
}

/**
 * Build all available swap options for a coin
 * Returns ETH, WETH, and all intermediate tokens in the swap path
 *
 * @param chainId - Chain ID
 * @param coinAddress - The coin to swap with
 * @param isBuying - True if buying the coin, false if selling
 * @returns All swap options with paths and token metadata
 */
export async function buildSwapOptions(
  chainId: CHAIN_ID,
  coinAddress: Address,
  isBuying: boolean
): Promise<BuildSwapOptionsResult | null> {
  const weth = WETH_ADDRESS[chainId]
  if (!weth) return null

  // Build main path: coin <-> WETH to discover all tokens
  const tokenIn = isBuying ? weth : coinAddress
  const tokenOut = isBuying ? coinAddress : weth

  const mainPath = await buildSwapPath(chainId, tokenIn, tokenOut)
  if (!mainPath) return null

  // Base tokens: ETH and WETH
  const ethInfo: CoinInfo = {
    address: NATIVE_TOKEN_ADDRESS,
    type: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
  }
  const wethInfo: CoinInfo = {
    address: weth,
    type: 'weth',
    symbol: 'WETH',
    name: 'Wrapped Ether',
  }

  const options: SwapOption[] = []

  // If no hops, just return ETH and WETH (direct swap or no path)
  if (!mainPath.hops || mainPath.hops.length === 0) {
    // Build ETH path (same as WETH but with wrapping/unwrapping)
    const ethPath = await buildSwapPath(
      chainId,
      isBuying ? NATIVE_TOKEN_ADDRESS : coinAddress,
      isBuying ? coinAddress : NATIVE_TOKEN_ADDRESS
    )

    options.push(
      {
        token: ethInfo,
        path: ethPath || { hops: [], isOptimal: true },
        isDirectSwap: true,
      },
      {
        token: wethInfo,
        path: mainPath,
        isDirectSwap: true,
      }
    )

    return { options, mainPath }
  }

  // Extract all unique tokens from the main path
  const allTokensInPath = new Set<string>()
  mainPath.hops.forEach((hop) => {
    allTokensInPath.add(hop.tokenIn.toLowerCase())
    allTokensInPath.add(hop.tokenOut.toLowerCase())
  })

  // Separate intermediate tokens (exclude WETH, ETH, and the coin itself)
  const intermediateAddresses: string[] = []
  allTokensInPath.forEach((addr) => {
    if (
      addr !== weth.toLowerCase() &&
      addr !== coinAddress.toLowerCase() &&
      addr !== NATIVE_TOKEN_ADDRESS.toLowerCase()
    ) {
      intermediateAddresses.push(addr)
    }
  })

  // Fetch coin info for all intermediate tokens
  // getCoinInfo now has built-in caching, so this reuses any fetches from buildSwapPath
  const intermediateTokens: CoinInfo[] = []
  for (const addr of intermediateAddresses) {
    const info = await getCoinInfo(chainId, addr as Address)
    if (info && info.symbol && info.type) {
      intermediateTokens.push(info)
    }
  }

  // Add ETH option (same as WETH but with wrapping/unwrapping)
  const ethPath = await buildSwapPath(
    chainId,
    isBuying ? NATIVE_TOKEN_ADDRESS : coinAddress,
    isBuying ? coinAddress : NATIVE_TOKEN_ADDRESS
  )
  options.push({
    token: ethInfo,
    path: ethPath || mainPath,
    isDirectSwap: !ethPath || ethPath.hops.length <= 1,
  })

  // Add WETH option (full main path)
  options.push({
    token: wethInfo,
    path: mainPath,
    isDirectSwap: mainPath.hops.length <= 1,
  })

  // Add intermediate token options using subpaths
  for (const token of intermediateTokens) {
    const tokenAddr = token.address.toLowerCase()
    let hopIndex = -1

    // Find which hop this token appears in
    for (let i = 0; i < mainPath.hops.length; i++) {
      const hop = mainPath.hops[i]
      if (
        hop.tokenIn.toLowerCase() === tokenAddr ||
        hop.tokenOut.toLowerCase() === tokenAddr
      ) {
        hopIndex = i
        break
      }
    }

    if (hopIndex === -1) {
      console.warn(`Token ${token.symbol} not found in main path`)
      continue
    }

    // Build subpath based on buy/sell direction
    let subPath: SwapPath

    if (isBuying) {
      // Buying: intermediate token -> coin
      // Take hops from where intermediate token appears to the end
      const hopsFromIntermediate = mainPath.hops.slice(hopIndex)

      // Check if the first hop starts with our token
      if (hopsFromIntermediate[0].tokenIn.toLowerCase() === tokenAddr) {
        subPath = { hops: hopsFromIntermediate, isOptimal: mainPath.isOptimal }
      } else {
        // Token is tokenOut of this hop, take from next hop
        subPath = {
          hops: mainPath.hops.slice(hopIndex + 1),
          isOptimal: mainPath.isOptimal,
        }
      }
    } else {
      // Selling: coin -> intermediate token
      // Take hops from start to where intermediate token appears
      const hopsToIntermediate = mainPath.hops.slice(0, hopIndex + 1)

      // Check if the last hop ends with our token
      const lastHop = hopsToIntermediate[hopsToIntermediate.length - 1]
      if (lastHop.tokenOut.toLowerCase() === tokenAddr) {
        subPath = { hops: hopsToIntermediate, isOptimal: mainPath.isOptimal }
      } else {
        // Token is tokenIn of this hop, don't include it
        subPath = {
          hops: mainPath.hops.slice(0, hopIndex),
          isOptimal: mainPath.isOptimal,
        }
      }
    }

    options.push({
      token,
      path: subPath,
      isDirectSwap: subPath.hops.length <= 1,
    })
  }

  return { options, mainPath }
}

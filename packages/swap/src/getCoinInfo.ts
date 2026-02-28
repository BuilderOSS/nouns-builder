import { NATIVE_TOKEN_ADDRESS, WETH_ADDRESS } from '@buildeross/constants/addresses'
import { clankerTokenRequest, zoraCoinRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { DEFAULT_CLANKER_TICK_SPACING, DYNAMIC_FEE_FLAG } from '@buildeross/utils/coining'
import { Address } from 'viem'

import { CoinInfo } from './types'

/**
 * In-memory cache for coin info
 * Key format: `${chainId}-${tokenAddress.toLowerCase()}`
 */
const coinInfoCache = new Map<string, Promise<CoinInfo | null>>()

/**
 * Clear the coin info cache (useful for testing or forcing refresh)
 */
export function clearCoinInfoCache(): void {
  coinInfoCache.clear()
}

/**
 * Internal implementation that fetches coin info without caching
 */
async function getCoinInfoUncached(
  chainId: CHAIN_ID,
  tokenAddress: Address
): Promise<CoinInfo | null> {
  const wethAddress = WETH_ADDRESS[chainId]

  // Check if it's native ETH
  if (tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
    return {
      address: NATIVE_TOKEN_ADDRESS,
      type: 'eth',
      symbol: 'ETH',
      name: 'Ethereum',
    }
  }

  // Check if it's WETH
  if (tokenAddress.toLowerCase() === wethAddress?.toLowerCase()) {
    return {
      address: wethAddress,
      type: 'weth',
      symbol: 'WETH',
      name: 'Wrapped Ether',
    }
  }

  // Try to fetch as ZoraCoin
  try {
    const coin = await zoraCoinRequest(tokenAddress, chainId)
    if (coin) {
      return {
        address: coin.coinAddress as Address,
        type: 'zora-coin',
        symbol: coin.symbol,
        name: coin.name,
        pairedToken: coin.currency as Address,
        poolKeyHash: coin.poolKeyHash as string,
        hooks: coin.poolHooks as Address,
        fee: BigInt(coin.poolFee),
        tickSpacing: coin.poolTickSpacing,
      }
    }
  } catch (e) {
    // Not a ZoraCoin, try ClankerToken
  }

  // Try to fetch as ClankerToken
  try {
    const token = await clankerTokenRequest(tokenAddress, chainId)
    if (token) {
      return {
        address: token.tokenAddress as Address,
        type: 'clanker-token',
        symbol: token.tokenSymbol,
        name: token.tokenName,
        pairedToken: token.pairedToken as Address,
        poolId: token.poolId as string,
        hooks: token.poolHook as Address,
        // ClankerTokens always use dynamic fees
        fee: BigInt(DYNAMIC_FEE_FLAG),
        tickSpacing: DEFAULT_CLANKER_TICK_SPACING,
      }
    }
  } catch (e) {
    // Not a ClankerToken either
  }

  return null
}

/**
 * Fetches coin information from the subgraph with caching
 * Caches results in memory to avoid duplicate API calls
 */
export async function getCoinInfo(
  chainId: CHAIN_ID,
  tokenAddress: Address
): Promise<CoinInfo | null> {
  const cacheKey = `${chainId}-${tokenAddress.toLowerCase()}`

  // Check cache first
  if (coinInfoCache.has(cacheKey)) {
    return coinInfoCache.get(cacheKey)!
  }

  // Fetch and cache the promise (not just the result)
  // This prevents multiple concurrent requests for the same token
  const promise = getCoinInfoUncached(chainId, tokenAddress)
  coinInfoCache.set(cacheKey, promise)

  return promise
}

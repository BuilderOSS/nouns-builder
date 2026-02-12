import { NATIVE_TOKEN_ADDRESS, WETH_ADDRESS } from '@buildeross/constants/addresses'
import { clankerTokenRequest, zoraCoinRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import {
  DEFAULT_CLANKER_TICK_SPACING,
  DYNAMIC_FEE_FLAG,
} from '@buildeross/utils/poolConfig'
import { Address } from 'viem'

import { CoinInfo } from './types'

/**
 * Fetches coin information from the subgraph
 */
export async function getCoinInfo(
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
    }
  }

  // Check if it's WETH
  if (tokenAddress.toLowerCase() === wethAddress?.toLowerCase()) {
    return {
      address: wethAddress,
      type: 'weth',
      symbol: 'WETH',
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

import { BigInt, Bytes } from '@graphprotocol/graph-ts'

import { ClankerToken, ZoraCoin } from '../../generated/schema'
import { CLANKER_TICK_SPACING, DYNAMIC_FEE_FLAG, WETH_ADDRESS } from './constants'

/**
 * Coin type constants for routing
 */
export namespace CoinType {
  export const WETH: string = 'WETH'
  export const CLANKER_TOKEN: string = 'CLANKER_TOKEN'
  export const ZORA_COIN: string = 'ZORA_COIN'
}

/**
 * Coin info for building swap paths
 */
export class CoinInfo {
  address: Bytes
  type: string
  pairedToken: Bytes | null
  poolId: Bytes | null // Uniswap V4 pool identifier (from either poolId or poolKeyHash)
  fee: BigInt | null
  hooks: Bytes | null
  tickSpacing: i32 // Use 0 as sentinel for null

  constructor(
    address: Bytes,
    type: string,
    pairedToken: Bytes | null,
    poolId: Bytes | null,
    fee: BigInt | null,
    hooks: Bytes | null,
    tickSpacing: i32
  ) {
    this.address = address
    this.type = type
    this.pairedToken = pairedToken
    this.poolId = poolId
    this.fee = fee
    this.hooks = hooks
    this.tickSpacing = tickSpacing
  }
}

/**
 * Load coin info from either ClankerToken or ZoraCoin
 * Returns null if the coin doesn't exist in the subgraph
 */
export function loadCoinInfo(tokenAddress: Bytes): CoinInfo | null {
  const tokenId = tokenAddress.toHexString()

  // Check if it's WETH
  if (tokenAddress.equals(WETH_ADDRESS)) {
    return new CoinInfo(
      tokenAddress,
      CoinType.WETH,
      null, // WETH has no pairedToken
      null, // WETH has no pool
      null,
      null,
      0 // tickSpacing 0 means not applicable
    )
  }

  // Try loading as ZoraCoin first
  const zoraCoin = ZoraCoin.load(tokenId)
  if (zoraCoin) {
    return new CoinInfo(
      zoraCoin.coinAddress,
      CoinType.ZORA_COIN,
      zoraCoin.currency,
      zoraCoin.poolKeyHash, // poolKeyHash is the Uniswap V4 pool identifier
      zoraCoin.poolFee,
      zoraCoin.poolHooks,
      zoraCoin.poolTickSpacing
    )
  }

  // Try loading as ClankerToken
  const clankerToken = ClankerToken.load(tokenId)
  if (clankerToken) {
    return new CoinInfo(
      clankerToken.tokenAddress,
      CoinType.CLANKER_TOKEN,
      clankerToken.pairedToken,
      clankerToken.poolId, // poolId is the Uniswap V4 pool identifier
      DYNAMIC_FEE_FLAG,
      clankerToken.poolHook,
      CLANKER_TICK_SPACING
    )
  }

  return null
}

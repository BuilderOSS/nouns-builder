import { COIN_SUPPORTED_CHAIN_IDS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'

/**
 * Checks if a chain ID supports coining functionality
 *
 * @param chainId - The chain ID to check
 * @returns {boolean} true if the chain supports coins/swaps, false otherwise
 */
export const isChainIdSupportedByCoining = (chainId: CHAIN_ID): boolean =>
  COIN_SUPPORTED_CHAIN_IDS.includes(chainId as (typeof COIN_SUPPORTED_CHAIN_IDS)[number])

/**
 * Uniswap v4 dynamic fee flag
 * When set in the fee field of a pool key, indicates the pool uses dynamic fees
 * @see https://docs.uniswap.org/contracts/v4/concepts/dynamic-fees
 */
export const DYNAMIC_FEE_FLAG: number = 0x800000

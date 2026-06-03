import {
  ALLOW_FAST_DAO_ON_MAINNET,
  PUBLIC_DEFAULT_CHAINS,
  TESTNET_CHAINS
} from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'

export const chainIdToSlug = (chainId: CHAIN_ID): string | undefined =>
  PUBLIC_DEFAULT_CHAINS.find((chain) => chain.id === chainId)?.slug

export const chainIdToName = (chainId: CHAIN_ID): string | undefined =>
  PUBLIC_DEFAULT_CHAINS.find((chain) => chain.id === chainId)?.name

export const isTestnetChain = (chainId: CHAIN_ID): boolean =>
  TESTNET_CHAINS.some((chain) => chain.id === chainId)

/**
 * Check if Fast DAO feature is allowed for the given chain
 * Returns true for testnet chains, or if ALLOW_FAST_DAO_ON_MAINNET is enabled
 */
export const isFastDAOAllowed = (chainId: CHAIN_ID): boolean =>
  isTestnetChain(chainId) || ALLOW_FAST_DAO_ON_MAINNET

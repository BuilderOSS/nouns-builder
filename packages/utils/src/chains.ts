import { PUBLIC_ALL_CHAINS, TESTNET_CHAINS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'

export const chainIdToSlug = (chainId: CHAIN_ID): string | undefined =>
  PUBLIC_ALL_CHAINS.find((chain) => chain.id === chainId)?.slug

export const chainIdToName = (chainId: CHAIN_ID): string | undefined =>
  PUBLIC_ALL_CHAINS.find((chain) => chain.id === chainId)?.name

export const isTestnetChain = (chainId: CHAIN_ID): boolean =>
  TESTNET_CHAINS.some((chain) => chain.id === chainId)

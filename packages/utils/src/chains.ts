import { type Chains, PUBLIC_ALL_CHAINS, TESTNET_CHAINS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'

export const chainIdToSlug = (chainId: CHAIN_ID): string | undefined =>
  PUBLIC_ALL_CHAINS.find((chain) => chain.id === chainId)?.slug

export const isTestnetChain = (chainId: CHAIN_ID): boolean =>
  TESTNET_CHAINS.some((chain) => chain.id === chainId)

export const getChainNamesString = (chains: Chains) => {
  const chainNames = chains.map((chain) => chain.name)
  if (chainNames.length === 1) {
    return chainNames[0]
  }
  if (chainNames.length === 2) {
    return chainNames.join(' and ')
  }
  return `${chainNames.slice(0, -1).join(', ')}, and ${chainNames.slice(-1)}`
}

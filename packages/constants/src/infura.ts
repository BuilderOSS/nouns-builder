import { CHAIN_ID } from '@buildeross/types'

const INFURA_NETWORKS: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'mainnet',
  [CHAIN_ID.SEPOLIA]: 'sepolia',
  [CHAIN_ID.BASE]: 'base-mainnet',
  [CHAIN_ID.BASE_SEPOLIA]: 'base-sepolia',
  [CHAIN_ID.OPTIMISM]: 'optimism-mainnet',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: 'optimism-sepolia',
}

const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY

export const getInfuraRpcUrl = (chainId: CHAIN_ID) => {
  const network = INFURA_NETWORKS[chainId]
  if (!network || !INFURA_API_KEY) {
    return undefined
  }
  return `https://${network}.g.alchemy.com/v2/${INFURA_API_KEY}`
}

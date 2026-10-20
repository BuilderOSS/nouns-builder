import { CHAIN_ID } from '@buildeross/types'

export const ALCHEMY_NETWORKS: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'eth-mainnet',
  [CHAIN_ID.OPTIMISM]: 'opt-mainnet',
  [CHAIN_ID.SEPOLIA]: 'eth-sepolia',
  [CHAIN_ID.BASE]: 'base-mainnet',
  [CHAIN_ID.BASE_SEPOLIA]: 'base-sepolia',
}

export const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

export const getAlchemyRpcUrl = (chainId: CHAIN_ID) => {
  const network = ALCHEMY_NETWORKS[chainId]
  if (!network || !ALCHEMY_API_KEY) {
    return undefined
  }
  return `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
}

// Server-only key for server-side Alchemy calls (e.g. transaction simulation).
// Falls back to the public key, which must then allow requests without an Origin.
export const getAlchemyServerRpcUrl = (chainId: CHAIN_ID) => {
  const network = ALCHEMY_NETWORKS[chainId]
  const apiKey = process.env.ALCHEMY_API_KEY || ALCHEMY_API_KEY
  if (!network || !apiKey) {
    return undefined
  }
  return `https://${network}.g.alchemy.com/v2/${apiKey}`
}

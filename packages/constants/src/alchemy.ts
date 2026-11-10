import { CHAIN_ID } from '@buildeross/types'

export const ALCHEMY_NETWORKS: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'eth-mainnet',
  [CHAIN_ID.OPTIMISM]: 'opt-mainnet',
  [CHAIN_ID.SEPOLIA]: 'eth-sepolia',
  [CHAIN_ID.BASE]: 'base-mainnet',
  [CHAIN_ID.BASE_SEPOLIA]: 'base-sepolia',
}

// Public key, locked to our domains with an allowlist: browser use only
export const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

export const getAlchemyRpcUrl = (chainId: CHAIN_ID) => {
  const network = ALCHEMY_NETWORKS[chainId]
  if (!network || !ALCHEMY_API_KEY) {
    return undefined
  }
  return `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
}

// Keyless URLs for server-side calls, which authenticate with an
// `Authorization` header instead (see `@buildeross/utils/alchemyAuth`)
export const getAlchemyServerRpcUrl = (chainId: CHAIN_ID) => {
  const network = ALCHEMY_NETWORKS[chainId]
  return network ? `https://${network}.g.alchemy.com/v2` : undefined
}

export const getAlchemyServerNftUrl = (chainId: CHAIN_ID) => {
  const network = ALCHEMY_NETWORKS[chainId]
  return network ? `https://${network}.g.alchemy.com/nft/v3` : undefined
}

export const ALCHEMY_PRICES_URL = 'https://api.g.alchemy.com/prices/v1'

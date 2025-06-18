import { CHAIN_ID } from 'src/typings'

const ALCHEMY_NETWORKS: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'eth-mainnet',
  [CHAIN_ID.OPTIMISM]: 'opt-mainnet',
  [CHAIN_ID.SEPOLIA]: 'eth-sepolia',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: 'opt-sepolia',
  [CHAIN_ID.BASE]: 'base-mainnet',
  [CHAIN_ID.BASE_SEPOLIA]: 'base-sepolia',
  [CHAIN_ID.ZORA]: 'zora-mainnet',
  [CHAIN_ID.ZORA_SEPOLIA]: 'zora-sepolia',
}

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

export const getAlchemyRpcUrl = (chainId: CHAIN_ID) => {
  const network = ALCHEMY_NETWORKS[chainId]
  if (!network || !ALCHEMY_API_KEY) {
    return undefined
  }
  return `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
}

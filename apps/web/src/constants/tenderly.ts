import { CHAIN_ID } from '@buildeross/types'

const TENDERLY_NETWORKS: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'mainnet',
  [CHAIN_ID.OPTIMISM]: 'optimism',
  [CHAIN_ID.SEPOLIA]: 'sepolia',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: 'optimism-sepolia',
  [CHAIN_ID.BASE]: 'base',
  [CHAIN_ID.BASE_SEPOLIA]: 'base-sepolia',
}

const TENDERLY_RPC_KEY = process.env.NEXT_PUBLIC_TENDERLY_RPC_KEY

export const getTenderlyRpcUrl = (chainId: CHAIN_ID) => {
  const network = TENDERLY_NETWORKS[chainId]
  if (!network || !TENDERLY_RPC_KEY) {
    return undefined
  }
  return `https://${network}.gateway.tenderly.co/${TENDERLY_RPC_KEY}`
}

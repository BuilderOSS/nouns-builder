import { CHAIN_ID } from '@buildeross/types'

// NOTE: Zora is not supported by EAS yet
export const isChainIdSupportedByEAS = (chainId: CHAIN_ID): boolean => {
  return !(chainId === CHAIN_ID.ZORA || chainId === CHAIN_ID.ZORA_SEPOLIA)
}

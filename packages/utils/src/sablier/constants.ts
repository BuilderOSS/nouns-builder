import { CHAIN_ID } from '@buildeross/types'

// Chains where Sablier is NOT supported
export const UNSUPPORTED_SABLIER_CHAINS = [CHAIN_ID.ZORA, CHAIN_ID.ZORA_SEPOLIA]

// Check if a chain supports Sablier
export function isSablierSupported(chainId: CHAIN_ID): boolean {
  return !UNSUPPORTED_SABLIER_CHAINS.includes(chainId)
}

// Error message for unsupported chains
export const UNSUPPORTED_CHAIN_ERROR =
  'Sablier streams are not supported on this network. Please switch to a supported chain.'

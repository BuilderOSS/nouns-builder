import { CHAIN_ID } from '@buildeross/types'

// URLs should not include a trailing forward slash
export const ETHERSCAN_BASE_URL: Record<CHAIN_ID, string> = {
  [CHAIN_ID.ETHEREUM]: 'https://etherscan.io',
  [CHAIN_ID.OPTIMISM]: 'https://optimistic.etherscan.io',
  [CHAIN_ID.SEPOLIA]: 'https://sepolia.etherscan.io',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: 'https://sepolia-optimism.etherscan.io',
  [CHAIN_ID.BASE]: 'https://basescan.org',
  [CHAIN_ID.BASE_SEPOLIA]: 'https://sepolia.basescan.org',
  [CHAIN_ID.ZORA]: 'https://explorer.zora.energy',
  [CHAIN_ID.ZORA_SEPOLIA]: 'https://sepolia.explorer.zora.energy',
  [CHAIN_ID.FOUNDRY]: '',
}

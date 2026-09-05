import { CHAIN_ID } from '@buildeross/types'

export const SAFE_APP_URL: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'https://app.safe.global/apps/open?safe=eth',
  [CHAIN_ID.OPTIMISM]: 'https://app.safe.global/apps/open?safe=oeth',
  [CHAIN_ID.BASE]: 'https://app.safe.global/apps/open?safe=base',
  [CHAIN_ID.SEPOLIA]: 'https://app.safe.global/apps/open?safe=sep',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: undefined,
  [CHAIN_ID.BASE_SEPOLIA]: 'https://app.safe.global/apps/open?safe=basesep',
}

export const SAFE_SERVICE_URL: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'https://safe-transaction-mainnet.safe.global',
  [CHAIN_ID.OPTIMISM]: 'https://safe-transaction-optimism.safe.global',
  [CHAIN_ID.BASE]: 'https://safe-transaction-base.safe.global',
  [CHAIN_ID.SEPOLIA]: 'https://safe-transaction-sepolia.safe.global',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: undefined,
  [CHAIN_ID.BASE_SEPOLIA]: 'https://safe-transaction-base-sepolia.safe.global',
}

export const SAFE_HOME_URL: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'https://app.safe.global/home?safe=eth',
  [CHAIN_ID.OPTIMISM]: 'https://app.safe.global/home?safe=oeth',
  [CHAIN_ID.BASE]: 'https://app.safe.global/home?safe=base',
  [CHAIN_ID.SEPOLIA]: 'https://app.safe.global/home?safe=sep',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: undefined,
  [CHAIN_ID.BASE_SEPOLIA]: 'https://app.safe.global/home?safe=basesep',
}

export const SAFE_CHAIN_PREFIX: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'eth',
  [CHAIN_ID.OPTIMISM]: 'oeth',
  [CHAIN_ID.BASE]: 'base',
  [CHAIN_ID.SEPOLIA]: 'sep',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: undefined,
  [CHAIN_ID.BASE_SEPOLIA]: 'basesep',
}

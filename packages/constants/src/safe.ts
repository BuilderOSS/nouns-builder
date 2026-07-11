import { CHAIN_ID } from '@buildeross/types'

export const SAFE_APP_URL: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'https://app.safe.global/apps/open?safe=eth',
  [CHAIN_ID.OPTIMISM]: 'https://app.safe.global/apps/open?safe=oeth',
  [CHAIN_ID.BASE]: 'https://app.safe.global/apps/open?safe=base',
  [CHAIN_ID.ZORA]: undefined,
  [CHAIN_ID.SEPOLIA]: 'https://app.safe.global/apps/open?safe=sep',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: undefined,
  [CHAIN_ID.BASE_SEPOLIA]: 'https://app.safe.global/apps/open?safe=basesep',
  [CHAIN_ID.ZORA_SEPOLIA]: undefined,
}

export const SAFE_HOME_URL: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: 'https://app.safe.global/home?safe=eth',
  [CHAIN_ID.OPTIMISM]: 'https://app.safe.global/home?safe=oeth',
  [CHAIN_ID.BASE]: 'https://app.safe.global/home?safe=base',
  [CHAIN_ID.ZORA]: undefined,
  [CHAIN_ID.SEPOLIA]: 'https://app.safe.global/home?safe=sep',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: undefined,
  [CHAIN_ID.BASE_SEPOLIA]: 'https://app.safe.global/home?safe=basesep',
  [CHAIN_ID.ZORA_SEPOLIA]: undefined,
}

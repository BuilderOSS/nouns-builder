import { CHAIN_ID } from '@buildeross/types'

export const COINING_ENABLED = process.env.NEXT_PUBLIC_COINING_ENABLED === 'true'

export const COIN_SUPPORTED_CHAIN_IDS: readonly CHAIN_ID[] = COINING_ENABLED
  ? [CHAIN_ID.BASE, CHAIN_ID.BASE_SEPOLIA]
  : []

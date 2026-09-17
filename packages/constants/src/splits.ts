import type { AddressType } from '@buildeross/types'
import { CHAIN_ID } from '@buildeross/types'

/**
 * 0xSplits v1 `SplitMain`. One deterministic deployment covers every chain the
 * app supports except Sepolia, which has its own.
 * https://etherscan.io/address/0x2ed6c4B5dA6378c7897AC67Ba9e43102Feb694EE
 */
const SPLIT_MAIN_DEFAULT = '0x2ed6c4B5dA6378c7897AC67Ba9e43102Feb694EE' as AddressType
const SPLIT_MAIN_SEPOLIA = '0x54E4a6014D36c381fC43b7E24A1492F556139a6F' as AddressType

export const SPLIT_MAIN_ADDRESS: Partial<Record<CHAIN_ID, AddressType>> = {
  [CHAIN_ID.ETHEREUM]: SPLIT_MAIN_DEFAULT,
  [CHAIN_ID.OPTIMISM]: SPLIT_MAIN_DEFAULT,
  [CHAIN_ID.BASE]: SPLIT_MAIN_DEFAULT,
  [CHAIN_ID.SEPOLIA]: SPLIT_MAIN_SEPOLIA,
  [CHAIN_ID.BASE_SEPOLIA]: SPLIT_MAIN_DEFAULT,
}

/** Allocations are expressed against 1e6, so 500000 is 50%. */
export const SPLIT_PERCENTAGE_SCALE = 1_000_000

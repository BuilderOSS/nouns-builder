import { EAS_SUPPORTED_CHAIN_IDS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'

export const isChainIdSupportedByEAS = (chainId: CHAIN_ID): boolean => {
  return !EAS_SUPPORTED_CHAIN_IDS.includes(chainId)
}

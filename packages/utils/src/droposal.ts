import { DROPOSAL_SUPPORTED_CHAIN_IDS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'

export const isChainIdSupportedByDroposal = (chainId: CHAIN_ID): boolean => {
  return DROPOSAL_SUPPORTED_CHAIN_IDS.includes(chainId)
}

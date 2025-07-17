import { EAS_GRAPHQL_URL } from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'

// NOTE: Zora is not supported by EAS yet
export const isChainIdSupportedByEAS = (chainId: CHAIN_ID): boolean => {
  return !!EAS_GRAPHQL_URL[chainId]
}

export interface DecodedData {
  name: string
  type: string
  value: {
    type: string
    value: string
  }
}

export const getDecodedValue = (
  decoded: DecodedData[],
  name: string
): string | undefined => {
  return decoded.find((d) => d.name === name)?.value.value
}

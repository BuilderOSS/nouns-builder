import { CHAIN_ID } from '@buildeross/types'
import { getAddress, Hex, isAddress } from 'viem'

import { getProvider } from './provider'

let isContractMap: Map<Hex, boolean>

const readIsContract = async (chainId: CHAIN_ID, address: Hex): Promise<boolean> => {
  if (!isAddress(address)) return false
  const provider = getProvider(chainId)
  const code = await provider.getCode({ address })
  const isEOA =
    !code || code === '0x' || (typeof code === 'string' && /^0x0*$/i.test(code))
  return !isEOA
}

export const getCachedIsContract = async (
  chainId: CHAIN_ID,
  address: Hex,
): Promise<boolean> => {
  if (!isAddress(address)) return false
  // eslint-disable-next-line no-param-reassign
  address = getAddress(address)
  if (!isContractMap) isContractMap = new Map()
  if (!isContractMap.has(address)) {
    isContractMap.set(address, await readIsContract(chainId, address))
  }
  return isContractMap.get(address)!
}

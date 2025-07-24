import { AddressType, CHAIN_ID } from '@buildeross/types'
import { serverConfig } from '@buildeross/utils'
import { readContract, readContracts } from 'wagmi/actions'

import { metadataAbi } from '../abis'

export const getPropertyItemsCount = async (
  chainId: CHAIN_ID,
  metadataAddress: AddressType,
) => {
  const baseParams = { address: metadataAddress, abi: metadataAbi, chainId: chainId }
  const propertiesCount = await readContract(serverConfig, {
    ...baseParams,
    functionName: 'propertiesCount',
  }).then((x) => Number(x))

  const contracts = Array(propertiesCount)
    .fill(0)
    .map((_, i) => {
      return {
        ...baseParams,
        functionName: 'itemsCount',
        args: [i],
      }
    })

  const propertyItemsCount = (await readContracts(serverConfig, {
    allowFailure: false,
    contracts,
  })) as bigint[]

  return {
    propertiesCount,
    propertyItemsCount: propertyItemsCount.map((x) => Number(x)),
  }
}

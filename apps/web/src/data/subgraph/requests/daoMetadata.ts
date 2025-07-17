import { AddressType, CHAIN_ID } from '@buildeross/types'
import { encodeFunctionData } from 'viem'

import { L1_CHAINS } from 'src/constants/chains'
import { metadataAbi } from 'src/data/contract/abis'

import { SDK } from '../client'

export const encodedDaoMetadataRequest = async (
  chain: CHAIN_ID,
  tokenAddress: AddressType
) => {
  if (!L1_CHAINS.find((x) => x === chain)) throw new Error('Only L1 Chains are supported')

  const res = await SDK.connect(chain)
    .daoMetadata({ tokenAddress: tokenAddress.toLowerCase(), first: 1000 })
    .then((x) => x.dao?.metadataProperties)

  if (!res) throw new Error('No metadata found')

  return res.map((property) =>
    encodeFunctionData({
      abi: metadataAbi,
      functionName: 'addProperties',
      args: [
        property.names,
        property.items,
        { baseUri: property.ipfsBaseUri, extension: property.ipfsExtension },
      ],
    })
  )
}

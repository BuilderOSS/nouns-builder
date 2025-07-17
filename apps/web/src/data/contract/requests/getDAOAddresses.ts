import { NULL_ADDRESS, PUBLIC_MANAGER_ADDRESS } from '@buildeross/constants/addresses'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { serverConfig } from '@buildeross/utils/wagmi/serverConfig'
import { readContract } from 'wagmi/actions'

import { getEscrowDelegate } from 'src/data/eas/requests/getEscrowDelegate'

import { managerAbi } from '../abis'

const getDAOAddresses = async (chainId: CHAIN_ID, tokenAddress: AddressType) => {
  const addresses = await readContract(serverConfig, {
    abi: managerAbi,
    address: PUBLIC_MANAGER_ADDRESS[chainId],
    functionName: 'getAddresses',
    args: [tokenAddress],
    chainId,
  })

  const [metadata, auction, treasury, governor] = unpackOptionalArray(addresses, 4)

  const escrowDelegate = await getEscrowDelegate(
    tokenAddress,
    treasury as AddressType,
    chainId
  )

  const hasMissingAddresses = Object.values(addresses).includes(NULL_ADDRESS)
  if (hasMissingAddresses) return null

  return {
    token: tokenAddress,
    auction,
    governor,
    metadata,
    treasury,
    escrowDelegate,
  }
}

export default getDAOAddresses

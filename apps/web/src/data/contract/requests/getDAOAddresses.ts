import { readContract } from 'wagmi/actions'

import { NULL_ADDRESS, PUBLIC_MANAGER_ADDRESS } from 'src/constants/addresses'
import { getEscrowDelegate } from 'src/data/eas/requests/getEscrowDelegate'
import { AddressType, CHAIN_ID } from 'src/typings'
import { unpackOptionalArray } from 'src/utils/helpers'
import { config } from 'src/utils/wagmi/server.config'

import { managerAbi } from '../abis'

const getDAOAddresses = async (chainId: CHAIN_ID, tokenAddress: AddressType) => {
  const addresses = await readContract(config, {
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

import { NULL_ADDRESS, PUBLIC_MANAGER_ADDRESS } from '@buildeross/constants'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { serverConfig, unpackOptionalArray, withTimeout } from '@buildeross/utils'
import { readContract } from 'wagmi/actions'

import { getEscrowDelegate } from '../../eas/requests/getEscrowDelegate'
import { managerAbi } from '../abis'

const getDAOAddresses = async (
  chainId: CHAIN_ID,
  tokenAddress: AddressType,
  fetchEscrowDelegate = true
) => {
  const addresses = await readContract(serverConfig, {
    abi: managerAbi,
    address: PUBLIC_MANAGER_ADDRESS[chainId],
    functionName: 'getAddresses',
    args: [tokenAddress],
    chainId,
  })

  const [metadata, auction, treasury, governor] = unpackOptionalArray(addresses, 4)

  const escrowDelegateFetcher = async () => {
    return getEscrowDelegate(tokenAddress, treasury as AddressType, chainId)
  }

  let escrowDelegate: AddressType | null = null
  if (fetchEscrowDelegate) {
    try {
      escrowDelegate = await withTimeout(escrowDelegateFetcher, 10000)
    } catch (e) {
      console.error(`getDAOAddresses: getEscrowDelegate failed:`, e)
    }
  }

  const hasMissingAddresses = Object.values(addresses).includes(NULL_ADDRESS)
  if (hasMissingAddresses) return null

  return {
    token: tokenAddress,
    auction,
    governor,
    metadata,
    treasury,
    escrowDelegate: escrowDelegate ?? undefined,
  }
}

export default getDAOAddresses

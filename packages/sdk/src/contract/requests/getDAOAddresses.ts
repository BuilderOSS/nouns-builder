import { PUBLIC_MANAGER_ADDRESS } from '@buildeross/constants'
import {
  AddressType,
  CHAIN_ID,
  DaoContractAddresses,
  RequiredDaoContractAddresses,
} from '@buildeross/types'
import { serverConfig, unpackOptionalArray } from '@buildeross/utils'
import { zeroAddress } from 'viem'
import { readContract } from 'wagmi/actions'

import { managerAbi } from '../abis'

const getDAOAddresses = async (
  chainId: CHAIN_ID,
  tokenAddress: AddressType
): Promise<RequiredDaoContractAddresses | null> => {
  const addresses = await readContract(serverConfig, {
    abi: managerAbi,
    address: PUBLIC_MANAGER_ADDRESS[chainId],
    functionName: 'getAddresses',
    args: [tokenAddress],
    chainId,
  })

  const [metadata, auction, treasury, governor] = unpackOptionalArray(addresses, 4)

  const daoAddresses = {
    token: tokenAddress,
    auction,
    governor,
    metadata,
    treasury,
  } as DaoContractAddresses
  const hasMissingAddresses = Object.values(daoAddresses).some(
    (address) => address === zeroAddress || address === undefined
  )
  if (hasMissingAddresses) return null

  return daoAddresses as RequiredDaoContractAddresses
}

export default getDAOAddresses

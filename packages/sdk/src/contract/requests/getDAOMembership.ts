import { PUBLIC_MANAGER_ADDRESS } from '@buildeross/constants'
import {
  AddressType,
  CHAIN_ID,
  DaoContractAddresses,
  RequiredDaoContractAddresses,
} from '@buildeross/types'
import { serverConfig, unpackOptionalArray } from '@buildeross/utils'
import { type Address, zeroAddress } from 'viem'
import { readContracts } from 'wagmi/actions'

import { managerAbi, tokenAbi } from '../abis'

export type GetDAOMembershipResponse = {
  daoAddresses: RequiredDaoContractAddresses
  balance: bigint
  votes: bigint
  hasBalance: boolean
  hasVotes: boolean
  isMember: boolean
}

export const getDAOMembership = async (
  chainId: CHAIN_ID,
  tokenAddress: AddressType,
  userAddress: AddressType
): Promise<GetDAOMembershipResponse | null> => {
  const [addresses, balance, votes] = await readContracts(serverConfig, {
    allowFailure: false,
    contracts: [
      {
        address: PUBLIC_MANAGER_ADDRESS[chainId],
        abi: managerAbi,
        chainId,
        functionName: 'getAddresses',
        args: [tokenAddress],
      },
      {
        address: tokenAddress as Address,
        abi: tokenAbi,
        chainId,
        functionName: 'balanceOf',
        args: [userAddress as Address],
      },
      {
        address: tokenAddress as Address,
        abi: tokenAbi,
        chainId,
        functionName: 'getVotes',
        args: [userAddress as Address],
      },
    ],
  })

  // Unpack DAO addresses from Manager response
  const [metadata, auction, treasury, governor] = unpackOptionalArray(addresses, 4)

  const daoAddresses = {
    token: tokenAddress,
    auction,
    governor,
    metadata,
    treasury,
  } as DaoContractAddresses

  // Validate DAO addresses
  const hasMissingAddresses = Object.values(daoAddresses).some(
    (address) => address === zeroAddress || address === undefined
  )

  if (hasMissingAddresses) return null

  // Calculate membership flags
  const hasBalance = balance > 0n
  const hasVotes = votes > 0n
  const isMember = hasBalance || hasVotes

  return {
    daoAddresses: daoAddresses as RequiredDaoContractAddresses,
    balance,
    votes,
    hasBalance,
    hasVotes,
    isMember,
  }
}

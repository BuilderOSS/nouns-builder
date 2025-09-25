import { SWR_KEYS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import useSWR, { KeyedMutator } from 'swr'
import { Address, isAddress } from 'viem'

import { NftTokenType } from './useNftMetadata'

export type SerializedNft = {
  tokenId: string
  tokenType: NftTokenType
  balance: string
  contract: {
    address: string
  }
  name: string | null
  image: {
    originalUrl: string
  }
  collection: {
    name: string | null
  }
}

export type NFTBalanceReturnType = {
  nfts?: SerializedNft[]
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<SerializedNft[]>
}

const fetchNFTBalance = async (
  chainId: CHAIN_ID,
  address: Address
): Promise<SerializedNft[]> => {
  const response = await fetch(`/api/nft-balances?chainId=${chainId}&address=${address}`)
  if (!response.ok) {
    throw new Error('Failed to fetch NFT balances')
  }
  const result = await response.json()
  return result.data || []
}

export const useNFTBalance = (
  chainId?: CHAIN_ID,
  address?: Address
): NFTBalanceReturnType => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!address && !!chainId && isAddress(address)
      ? ([SWR_KEYS.NFT_BALANCES, chainId, address] as const)
      : null,
    async ([, _chainId, _address]) =>
      fetchNFTBalance(_chainId as CHAIN_ID, _address as Address),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    nfts: data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}

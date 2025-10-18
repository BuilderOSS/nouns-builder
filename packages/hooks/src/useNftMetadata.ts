import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { CHAIN_ID } from '@buildeross/types'
import useSWR, { KeyedMutator } from 'swr'
import { Address, isAddress } from 'viem'

export declare enum NftTokenType {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  NO_SUPPORTED_NFT_STANDARD = 'NO_SUPPORTED_NFT_STANDARD',
  NOT_A_CONTRACT = 'NOT_A_CONTRACT',
  UNKNOWN = 'UNKNOWN',
}

export type SerializedNftMetadata = {
  contract: {
    address: string
  }
  tokenId: string
  tokenType: NftTokenType
  name: string | null
  description: string | null
  image: string | null
  tokenUri: string | null
}

export type NftMetadataReturnType = {
  metadata: SerializedNftMetadata | null | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<SerializedNftMetadata | null>
}

const fetchNftMetadata = async (
  chainId: CHAIN_ID,
  contractAddress: Address,
  tokenId: string
): Promise<SerializedNftMetadata | null> => {
  const response = await fetch(
    `${BASE_URL}/api/alchemy/nft-metadata?chainId=${chainId}&contractAddress=${contractAddress}&tokenId=${tokenId}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch NFT metadata')
  }
  const result = await response.json()
  return result.data || null
}

export const useNftMetadata = (
  chainId?: CHAIN_ID,
  contractAddress?: Address,
  tokenId?: string
): NftMetadataReturnType => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!contractAddress &&
      !!tokenId &&
      !!chainId &&
      isAddress(contractAddress) &&
      /^\d+$/.test(tokenId)
      ? ([SWR_KEYS.NFT_METADATA, chainId, contractAddress, tokenId] as const)
      : null,
    async ([, _chainId, _contractAddress, _tokenId]) =>
      fetchNftMetadata(
        _chainId as CHAIN_ID,
        _contractAddress as Address,
        _tokenId as string
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    metadata: data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}

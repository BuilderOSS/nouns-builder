import SWR_KEYS from '@buildeross/constants/swrKeys'
import { CHAIN_ID } from '@buildeross/types'
import useSWR from 'swr'
import { Address, isAddress } from 'viem'

import { SerializedNftMetadata } from 'src/services/alchemyService'

export type NftMetadataReturnType = {
  metadata?: SerializedNftMetadata | null
  isLoading: boolean
  error?: Error | null
}

const fetchNftMetadata = async (
  chainId: CHAIN_ID,
  contractAddress: Address,
  tokenId: string
): Promise<SerializedNftMetadata | null> => {
  const response = await fetch(
    `/api/nft-metadata?chainId=${chainId}&contractAddress=${contractAddress}&tokenId=${tokenId}`
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
  const { data, error, isLoading } = useSWR(
    !!contractAddress &&
      !!tokenId &&
      !!chainId &&
      isAddress(contractAddress) &&
      /^\d+$/.test(tokenId)
      ? [SWR_KEYS.NFT_METADATA, chainId, contractAddress, tokenId]
      : null,
    async () =>
      fetchNftMetadata(
        chainId as CHAIN_ID,
        contractAddress as Address,
        tokenId as string
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    metadata: data,
    isLoading,
    error,
  }
}

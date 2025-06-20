import useSWR from 'swr'
import { Address, isAddress } from 'viem'

import SWR_KEYS from 'src/constants/swrKeys'
import { SerializedNft } from 'src/services/alchemyService'
import { CHAIN_ID } from 'src/typings'

export type NFTBalanceReturnType = {
  nfts?: SerializedNft[]
  isLoading: boolean
  error?: Error | null
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
  const { data, error, isLoading } = useSWR(
    !!address && !!chainId && isAddress(address)
      ? [SWR_KEYS.NFT_BALANCES, chainId, address]
      : null,
    async () => fetchNFTBalance(chainId as CHAIN_ID, address as Address),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    nfts: data,
    isLoading,
    error,
  }
}

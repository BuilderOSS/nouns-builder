import SWR_KEYS from '@buildeross/constants/swrKeys'
import { CHAIN_ID } from '@buildeross/types'
import useSWR from 'swr'
import { Address, isAddress } from 'viem'

export type TokenMetadata = {
  address: Address
  name: string
  symbol: string
  decimals: number
  logo: string
}

export type TokenMetadataReturnType = {
  metadata?: TokenMetadata[]
  isLoading: boolean
  error?: Error | null
}

const fetchTokenMetadata = async (
  chainId: CHAIN_ID,
  addresses: Address[]
): Promise<TokenMetadata[]> => {
  const addressParam = addresses.join(',')
  const response = await fetch(
    `/api/token-metadata?chainId=${chainId}&addresses=${addressParam}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch token metadata')
  }
  const result = await response.json()
  return result.data || []
}

// Hook for multiple token addresses
export const useTokenMetadata = (
  chainId?: CHAIN_ID,
  addresses?: Address[]
): TokenMetadataReturnType => {
  const validAddresses = (addresses?.filter((addr) => isAddress(addr)) || []).map(
    (addr) => addr.toLowerCase() as Address
  )

  const { data, error, isLoading } = useSWR(
    !!chainId && validAddresses.length > 0
      ? [SWR_KEYS.TOKEN_METADATA, chainId, validAddresses.sort().join(',')]
      : null,
    async () => fetchTokenMetadata(chainId as CHAIN_ID, validAddresses),
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

// Hook for a single token address
export const useTokenMetadataSingle = (
  chainId?: CHAIN_ID,
  address?: Address
): TokenMetadataReturnType & { tokenMetadata?: TokenMetadata } => {
  const result = useTokenMetadata(chainId, address ? [address] : undefined)

  return {
    ...result,
    tokenMetadata: result.metadata?.[0],
  }
}

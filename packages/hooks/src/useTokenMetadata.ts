import { SWR_KEYS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { useMemo } from 'react'
import { type KeyedMutator } from 'swr'
import useSWRImmutable from 'swr/immutable'
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
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<TokenMetadata[]>
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
  const validAddresses = useMemo(
    () =>
      (addresses?.filter((addr) => isAddress(addr)) || [])
        .map((addr) => addr.toLowerCase() as Address)
        .sort(),
    [addresses]
  )

  const { data, error, isLoading, isValidating, mutate } = useSWRImmutable(
    !!chainId && validAddresses.length > 0
      ? ([SWR_KEYS.TOKEN_METADATA, chainId, validAddresses.join(',')] as const)
      : null,
    async ([, _chainId, _addressesParam]) => {
      const _addresses = _addressesParam.split(',') as Address[]
      return fetchTokenMetadata(_chainId as CHAIN_ID, _addresses)
    },
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

// Hook for a single token address
export const useTokenMetadataSingle = (
  chainId?: CHAIN_ID,
  address?: Address
): Omit<TokenMetadataReturnType, 'metadata'> & { tokenMetadata?: TokenMetadata } => {
  const result = useTokenMetadata(chainId, address ? [address] : undefined)

  return {
    isLoading: result.isLoading,
    isValidating: result.isValidating,
    error: result.error,
    mutate: result.mutate,
    tokenMetadata: result.metadata?.[0],
  }
}

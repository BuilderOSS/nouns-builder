import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'
import { type Address, isAddress } from 'viem'

export type PinnedAssetInput = {
  tokenType: 0 | 1 | 2
  token: Address
  isCollection: boolean
  tokenId?: string
}

export type EnrichedPinnedAsset = {
  tokenType: 0 | 1 | 2
  token: Address
  isCollection: boolean
  tokenId?: string
  // ERC20 fields
  balance?: string
  name?: string
  symbol?: string
  decimals?: number
  logo?: string
  price?: string
  valueInUSD?: string
  // NFT fields
  nftName?: string
  nftImage?: string
  // Metadata
  isPinned: true
}

export type EnrichedPinnedAssetsReturnType = {
  enrichedPinnedAssets: undefined | EnrichedPinnedAsset[]
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<EnrichedPinnedAsset[]>
}

const fetchEnrichedPinnedAssets = async (
  chainId: CHAIN_ID,
  treasuryAddress: Address,
  pinnedAssets: PinnedAssetInput[]
): Promise<EnrichedPinnedAsset[]> => {
  const response = await fetch(`${BASE_URL}/api/alchemy/pinned-assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chainId,
      treasuryAddress,
      pinnedAssets,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch enriched pinned assets')
  }
  const result = await response.json()
  return result.data || []
}

export const useEnrichedPinnedAssets = (
  chainId?: CHAIN_ID,
  treasuryAddress?: Address,
  pinnedAssets?: PinnedAssetInput[]
): EnrichedPinnedAssetsReturnType => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!treasuryAddress &&
      !!chainId &&
      isAddress(treasuryAddress) &&
      pinnedAssets &&
      pinnedAssets.length > 0
      ? ([
          SWR_KEYS.ENRICHED_PINNED_ASSETS,
          chainId,
          treasuryAddress,
          JSON.stringify(pinnedAssets),
        ] as const)
      : null,
    ([, chainId, treasuryAddress, pinnedAssetsJson]) =>
      fetchEnrichedPinnedAssets(chainId, treasuryAddress, JSON.parse(pinnedAssetsJson)),
    { revalidateOnFocus: false }
  )

  return {
    enrichedPinnedAssets: data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}

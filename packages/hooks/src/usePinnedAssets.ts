import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { type PinnedAsset } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'
import { type Address, isAddress } from 'viem'

export type PinnedAssetsReturnType = {
  pinnedAssets: undefined | PinnedAsset[]
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<PinnedAsset[]>
}

const fetchPinnedAssets = async (
  chainId: CHAIN_ID,
  daoAddress: Address
): Promise<PinnedAsset[]> => {
  const params = new URLSearchParams()
  params.set('chainId', chainId.toString())
  params.set('daoAddress', daoAddress)

  const response = await fetch(`${BASE_URL}/api/pinned-assets?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch pinned assets')
  }
  const result = await response.json()
  return result.data || []
}

export const usePinnedAssets = (
  chainId?: CHAIN_ID,
  daoAddress?: Address
): PinnedAssetsReturnType => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!daoAddress && !!chainId && isAddress(daoAddress)
      ? ([SWR_KEYS.PINNED_ASSETS, chainId, daoAddress] as const)
      : null,
    ([, chainId, daoAddress]) => fetchPinnedAssets(chainId, daoAddress),
    { revalidateOnFocus: false }
  )

  return {
    pinnedAssets: data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}

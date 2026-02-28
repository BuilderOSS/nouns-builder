import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { daoZoraDropsRequest, type ZoraDropFragment } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { isChainIdSupportedByDroposal } from '@buildeross/utils/droposal'
import useSWR, { type KeyedMutator } from 'swr'

export const useZoraDrops = ({
  chainId,
  collectionAddress,
  enabled = true,
  first = 100,
}: {
  chainId: CHAIN_ID
  collectionAddress?: AddressType
  enabled?: boolean
  first?: number
}): {
  data: ZoraDropFragment[] | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<ZoraDropFragment[]>
} => {
  // Check if chain is supported
  const isChainSupported = isChainIdSupportedByDroposal(chainId)
  const chainError = !isChainSupported
    ? new Error(`ZoraDrops are not supported on ${chainId}`)
    : undefined

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!collectionAddress && enabled && isChainSupported
      ? ([SWR_KEYS.ZORA_DROPS, chainId, collectionAddress, first] as const)
      : null,
    async ([, _chainId, _collectionAddress, _first]) =>
      daoZoraDropsRequest(
        _collectionAddress as AddressType,
        _chainId as CHAIN_ID,
        _first
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    data: isChainSupported ? data : undefined,
    isLoading: isChainSupported ? isLoading : false,
    isValidating: isChainSupported ? isValidating : false,
    error: enabled ? chainError || error : undefined,
    mutate,
  }
}

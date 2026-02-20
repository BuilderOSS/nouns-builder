import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { daoZoraCoinsRequest, type ZoraCoinFragment } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import useSWR, { type KeyedMutator } from 'swr'

export const useZoraCoins = ({
  chainId,
  collectionAddress,
  enabled = true,
  first = 10,
}: {
  chainId: CHAIN_ID
  collectionAddress?: AddressType
  enabled?: boolean
  first?: number
}): {
  data: ZoraCoinFragment[] | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<ZoraCoinFragment[]>
} => {
  // Check if chain is supported
  const isChainSupported = isChainIdSupportedByCoining(chainId)
  const chainError = !isChainSupported
    ? new Error(`ZoraCoins are only supported on Base and Base Sepolia`)
    : undefined

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!collectionAddress && enabled && isChainSupported
      ? ([SWR_KEYS.ZORA_COINS, chainId, collectionAddress, first] as const)
      : null,
    async ([, _chainId, _collectionAddress, _first]) =>
      daoZoraCoinsRequest(
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
    error: chainError || error,
    mutate,
  }
}

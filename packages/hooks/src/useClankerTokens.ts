import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  type ClankerTokenFragment,
  daoClankerTokensRequest,
} from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import useSWR, { type KeyedMutator } from 'swr'

export const useClankerTokens = ({
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
  data: ClankerTokenFragment[] | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<ClankerTokenFragment[]>
} => {
  // Check if chain is supported
  const isChainSupported = isChainIdSupportedByCoining(chainId)
  const chainError = !isChainSupported
    ? new Error(`ClankerTokens are only supported on Base and Base Sepolia`)
    : undefined

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    !!collectionAddress && enabled && isChainSupported
      ? ([SWR_KEYS.CLANKER_TOKENS, chainId, collectionAddress, first] as const)
      : null,
    async ([, _chainId, _collectionAddress, _first]) =>
      daoClankerTokensRequest(
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

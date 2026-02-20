import { COIN_SUPPORTED_CHAINS } from '@buildeross/constants/chains'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  type ClankerTokenFragment,
  daoClankerTokensRequest,
} from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { getChainNamesString } from '@buildeross/utils/chains'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import useSWR, { type KeyedMutator } from 'swr'

const supportedChains = getChainNamesString(COIN_SUPPORTED_CHAINS)

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
    ? new Error(`ClankerTokens are only supported on ${supportedChains}`)
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

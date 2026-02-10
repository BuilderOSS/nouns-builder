import { COIN_SUPPORTED_CHAIN_IDS } from '@buildeross/constants/chains'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  daosWithClankerTokensRequest,
  type DaosWithClankerTokensResponse,
} from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'

export const useDaosWithClankerTokens = ({
  chainId,
  daoAddresses,
  enabled = true,
}: {
  chainId: CHAIN_ID
  daoAddresses: AddressType[]
  enabled?: boolean
}): {
  data: DaosWithClankerTokensResponse | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<DaosWithClankerTokensResponse>
} => {
  // Check if chain is supported
  const isChainSupported = COIN_SUPPORTED_CHAIN_IDS.includes(
    chainId as (typeof COIN_SUPPORTED_CHAIN_IDS)[number]
  )
  const chainError = !isChainSupported
    ? new Error(`ClankerTokens are only supported on coin-enabled chains`)
    : undefined

  // Sort addresses for consistent cache keys
  const sortedAddresses = [...daoAddresses].sort()

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled && isChainSupported && daoAddresses.length > 0
      ? ([SWR_KEYS.DAOS_WITH_CLANKER_TOKENS, chainId, sortedAddresses.join(',')] as const)
      : null,
    async ([, _chainId]) =>
      daosWithClankerTokensRequest(sortedAddresses, _chainId as CHAIN_ID),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Cache for 5 minutes
      dedupingInterval: 300000,
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

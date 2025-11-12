import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getEscrowDelegate } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import useSWR, { type KeyedMutator } from 'swr'

export type UseEscrowDelegateProps = {
  chainId?: CHAIN_ID
  tokenAddress?: AddressType
  treasuryAddress?: AddressType
}

export type UseEscrowDelegateReturnType = {
  escrowDelegate: AddressType | null | undefined
  isValidating: boolean
  isLoading: boolean
  error?: Error | null
  mutate: KeyedMutator<AddressType | null>
}

export const useEscrowDelegate = ({
  chainId,
  tokenAddress,
  treasuryAddress,
}: UseEscrowDelegateProps): UseEscrowDelegateReturnType => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<AddressType | null>(
    chainId && treasuryAddress && tokenAddress
      ? ([SWR_KEYS.ESCROW_DELEGATE, chainId, treasuryAddress, tokenAddress] as const)
      : null,
    async ([, _chainId, _treasuryAddress, _tokenAddress]) =>
      getEscrowDelegate(
        _tokenAddress as AddressType,
        _treasuryAddress as AddressType,
        _chainId as CHAIN_ID
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 60_000,
    }
  )

  return {
    escrowDelegate: data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}

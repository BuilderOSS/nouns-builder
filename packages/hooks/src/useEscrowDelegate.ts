import { SWR_KEYS } from '@buildeross/constants'
import { getEscrowDelegate } from '@buildeross/sdk'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import useSWR from 'swr'

export type UseEscrowDelegateProps = {
  chainId?: CHAIN_ID
  tokenAddress?: AddressType
  treasuryAddress?: AddressType
}

export type UseEscrowDelegateReturnType = {
  escrowDelegate: AddressType | null | undefined
  isLoading: boolean
  error?: Error | null
  mutate: () => Promise<AddressType | null | undefined>
}

export const useEscrowDelegate = ({
  chainId,
  tokenAddress,
  treasuryAddress,
}: UseEscrowDelegateProps): UseEscrowDelegateReturnType => {
  const { data, error, isLoading, mutate } = useSWR<AddressType | null>(
    chainId && treasuryAddress && tokenAddress
      ? [SWR_KEYS.ESCROW_DELEGATE, chainId, treasuryAddress, tokenAddress]
      : null,
    async () =>
      getEscrowDelegate(
        tokenAddress as AddressType,
        treasuryAddress as AddressType,
        chainId as CHAIN_ID
      )
  )

  return {
    escrowDelegate: data,
    isLoading,
    error,
    mutate,
  }
}

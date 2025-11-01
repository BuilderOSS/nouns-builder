import { type AddressType, CHAIN_ID } from '@buildeross/types'
import { getCachedIsContract } from '@buildeross/utils/isContract'
import { type KeyedMutator } from 'swr'
import useSWRImmutable from 'swr/immutable'

export const useIsContract = ({
  address,
  chainId = CHAIN_ID.ETHEREUM,
}: {
  address?: AddressType
  chainId?: CHAIN_ID
}): {
  data: boolean | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<boolean>
} => {
  const { data, isLoading, isValidating, error, mutate } = useSWRImmutable<boolean>(
    address && chainId ? ([address, chainId] as const) : null,
    async ([_address, _chainId]: [AddressType, CHAIN_ID]) => {
      return getCachedIsContract(_chainId, _address)
    }
  )

  return {
    data,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}

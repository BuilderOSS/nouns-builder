import { AddressType, CHAIN_ID } from '@buildeross/types'
import { getCachedIsContract } from '@buildeross/utils'
import useSWRImmutable from 'swr/immutable'

export const useIsContract = ({
  address,
  chainId = CHAIN_ID.ETHEREUM,
}: {
  address?: AddressType
  chainId?: CHAIN_ID
}) => {
  return useSWRImmutable<boolean>(
    address && chainId ? [address, chainId] : null,
    async ([address, chainId]: [AddressType, CHAIN_ID]) => {
      return getCachedIsContract(chainId, address)
    },
  )
}

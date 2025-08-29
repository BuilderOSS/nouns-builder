import { AddressType, CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils'
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
      const provider = getProvider(chainId)
      const code = await provider.getCode({ address })
      const isEOA =
        !code || code === '0x' || (typeof code === 'string' && /^0x0*$/i.test(code))
      return !isEOA
    }
  )
}

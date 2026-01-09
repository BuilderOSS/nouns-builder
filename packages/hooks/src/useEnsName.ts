import { SWR_KEYS } from '@buildeross/constants'
import { getEnsName } from '@buildeross/utils'
import useSWR from 'swr'
import { Address, getAddress, isAddress } from 'viem'

export type UseEnsNameResult = {
  ensName?: string
  isLoading: boolean
  error?: Error
}

/**
 * Hook to resolve an Ethereum address to a name with proper hierarchy:
 * 1. Basenames (*.base.eth)
 * 2. ENS names (*.eth)
 * 3. Returns undefined if no name is found
 */
export const useEnsName = (address?: Address | string): UseEnsNameResult => {
  const isAddressValid = !!address && isAddress(address, { strict: false })
  const checksummedAddress = isAddressValid ? getAddress(address) : undefined

  const { data, isLoading, error } = useSWR(
    checksummedAddress ? [SWR_KEYS.ENS_NAME, checksummedAddress] : null,
    async () => {
      if (!checksummedAddress) return null
      const name = await getEnsName(checksummedAddress)
      // Only return if it's actually a name, not the address itself
      return name !== checksummedAddress ? name : null
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60_000,
    }
  )

  return {
    ensName: data ?? undefined,
    isLoading,
    error,
  }
}

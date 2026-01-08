import { SWR_KEYS } from '@buildeross/constants'
import { getEnsAddress } from '@buildeross/utils'
import useSWR from 'swr'
import { Address, getAddress, isAddress } from 'viem'

export type UseEnsAddressResult = {
  address?: Address
  isLoading: boolean
  error?: Error
}

/**
 * Hook to resolve an ENS/Basename to an address with proper hierarchy:
 * 1. Basenames (*.base.eth)
 * 2. ENS names (*.eth)
 * 3. Returns undefined if resolution fails
 */
export const useEnsAddress = (name?: string): UseEnsAddressResult => {
  const normalizedName = name?.toLowerCase()

  const { data, isLoading, error } = useSWR(
    normalizedName ? [SWR_KEYS.ENS_ADDRESS, normalizedName] : null,
    async () => {
      if (!normalizedName) return null
      const address = await getEnsAddress(normalizedName)
      // Only return if it's a valid address, not the input name
      return isAddress(address, { strict: false }) ? getAddress(address) : null
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // No dedupingInterval - rely on in-memory cache in utils
      // SWR will cache for the page session, and utils cache handles deduplication
    }
  )

  return {
    address: data ?? undefined,
    isLoading,
    error,
  }
}

import { SWR_KEYS } from '@buildeross/constants'
import { getEnsAvatar } from '@buildeross/utils'
import useSWR from 'swr'

export type UseEnsAvatarResult = {
  avatar?: string
  isLoading: boolean
  error?: Error
}

/**
 * Hook to resolve an ENS/Basename to an avatar with proper hierarchy:
 * 1. Basenames (*.base.eth)
 * 2. ENS names (*.eth)
 * 3. Returns undefined if no avatar is set
 */
export const useEnsAvatar = (name?: string): UseEnsAvatarResult => {
  const normalizedName = name?.toLowerCase()

  const { data, isLoading, error } = useSWR(
    normalizedName ? [SWR_KEYS.ENS_AVATAR, normalizedName] : null,
    async () => {
      if (!normalizedName) return null
      return await getEnsAvatar(normalizedName)
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // No dedupingInterval - rely on in-memory cache in utils
      // SWR will cache for the page session, and utils cache handles deduplication
    }
  )

  return {
    avatar: data ?? undefined,
    isLoading,
    error,
  }
}

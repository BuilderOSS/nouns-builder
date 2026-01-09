import { walletSnippet } from '@buildeross/utils/helpers'
import { useMemo } from 'react'
import { Address, getAddress, isAddress } from 'viem'

import { useEnsAddress } from './useEnsAddress'
import { useEnsAvatar } from './useEnsAvatar'
import { useEnsName } from './useEnsName'

export type EnsData = {
  ensName?: string
  ensAvatar?: string
  ethAddress?: Address
  isLoading: boolean
  displayName: string
  error?: Error
}

/**
 * Hook to resolve ENS/Basename data with proper hierarchy:
 * 1. Basenames (*.base.eth)
 * 2. ENS names (*.eth)
 * 3. Ethereum addresses (0x...)
 */
export const useEnsData = (addressOrName?: string): EnsData => {
  const isAddressValid = !!addressOrName && isAddress(addressOrName, { strict: false })
  const inputAddress = isAddressValid ? getAddress(addressOrName) : undefined
  const inputName =
    isAddressValid || !addressOrName ? undefined : addressOrName.toLowerCase()

  // Resolve address to name (checks basenames first, then ENS)
  const {
    ensName: resolvedName,
    isLoading: nameLoading,
    error: nameError,
  } = useEnsName(inputAddress)

  // Resolve name to address (checks basenames first, then ENS)
  const {
    address: resolvedAddress,
    isLoading: addressLoading,
    error: addressError,
  } = useEnsAddress(inputName)

  // The final name to use for avatar lookup
  const nameForAvatar = resolvedName ?? inputName

  // Resolve avatar (checks basenames first, then ENS)
  const {
    avatar,
    isLoading: avatarLoading,
    error: avatarError,
  } = useEnsAvatar(nameForAvatar)

  const ethAddress = (inputAddress ?? resolvedAddress ?? undefined) as
    | `0x${string}`
    | undefined

  const finalEnsName = resolvedName ?? (resolvedAddress ? inputName : undefined)

  const displayName = useMemo(() => {
    return finalEnsName ?? (addressOrName ? walletSnippet(addressOrName) : '')
  }, [finalEnsName, addressOrName])

  const isLoading = nameLoading || addressLoading || avatarLoading

  // Combine errors from all SWR calls
  const error = nameError || addressError || avatarError

  return {
    ensName: finalEnsName?.toLowerCase(),
    isLoading,
    ensAvatar: avatar,
    ethAddress: ethAddress ? getAddress(ethAddress) : undefined,
    displayName,
    error,
  }
}

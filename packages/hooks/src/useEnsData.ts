import { walletSnippet } from '@buildeross/utils/helpers'
import { Address, getAddress, isAddress } from 'viem'
import { useEnsAddress, useEnsAvatar, useEnsName } from 'wagmi'

export type EnsData = {
  ensName?: string
  ensAvatar?: string
  ethAddress?: Address
  isLoading: boolean
  displayName: string
}

export const useEnsData = (addressOrName?: string): EnsData => {
  const isAddressValid = !!addressOrName && isAddress(addressOrName, { strict: false })
  const inputAddress = isAddressValid ? getAddress(addressOrName) : undefined
  const inputName =
    isAddressValid || !addressOrName ? undefined : addressOrName.toLowerCase()

  const { data: ensName, isLoading: ensNameLoading } = useEnsName({
    address: inputAddress,
    chainId: 1,
    query: {
      enabled: !!inputAddress,
      staleTime: Infinity,
    },
  })

  const { data: ensAddress, isLoading: ensAddressLoading } = useEnsAddress({
    name: inputName,
    chainId: 1,
    query: {
      enabled: !!inputName,
      staleTime: Infinity,
    },
  })

  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    name: ensName ?? inputName,
    chainId: 1,
    query: {
      enabled: !!ensName || !!inputName,
      staleTime: Infinity,
    },
  })

  const ethAddress = (inputAddress ?? ensAddress ?? undefined) as
    | `0x${string}`
    | undefined

  const finalEnsName = ensName ?? (ensAddress ? inputName : undefined)

  const displayName = finalEnsName ?? (addressOrName ? walletSnippet(addressOrName) : '')

  const isLoading = ensNameLoading || ensAddressLoading || ensAvatarLoading

  return {
    ensName: finalEnsName?.toLowerCase(),
    isLoading,
    ensAvatar: ensAvatar ?? undefined,
    ethAddress: ethAddress ? getAddress(ethAddress) : undefined,
    displayName,
  }
}

import { walletSnippet } from '@buildeross/utils'
import { Address, isAddress } from 'viem'
import { useEnsAddress, useEnsAvatar, useEnsName } from 'wagmi'

export type EnsData = {
  ensName?: string
  ensAvatar?: string
  ethAddress?: Address
  isLoading: boolean
  displayName: string
}

export const useEnsData = (addressOrName?: string): EnsData => {
  const isAddressValid = !!addressOrName && isAddress(addressOrName)
  const inputAddress = isAddressValid ? (addressOrName as Address) : undefined
  const inputName = isAddressValid ? undefined : (addressOrName as string)

  const { data: ensName, isLoading: ensNameLoading } = useEnsName({
    address: inputAddress,
    chainId: 1,
    query: {
      enabled: !!inputAddress,
    },
  })

  const { data: ensAddress, isLoading: ensAddressLoading } = useEnsAddress({
    name: inputName,
    chainId: 1,
    query: {
      enabled: !!inputName,
    },
  })

  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    name: ensName ?? inputName,
    chainId: 1,
    query: {
      enabled: !!ensName || !!inputName,
    },
  })

  const ethAddress = (inputAddress?.toLowerCase() ??
    ensAddress?.toLowerCase() ??
    undefined) as `0x${string}` | undefined

  const finalEnsName = ensName ?? (ensAddress ? inputName : undefined)

  const displayName = finalEnsName ?? (addressOrName ? walletSnippet(addressOrName) : '')

  const isLoading = ensNameLoading || ensAddressLoading || ensAvatarLoading

  return {
    ensName: finalEnsName,
    isLoading,
    ensAvatar: ensAvatar ?? undefined,
    ethAddress,
    displayName,
  }
}

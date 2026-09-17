import { getProfileLinkOverrides } from '@buildeross/sdk/subgraph'
import type { AddressType } from '@buildeross/types'
import { CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import {
  getProfileIdentity,
  type ProfileIdentity,
  type ProfileIdentityRecords,
} from 'src/utils/profileIdentity'
import useSWR from 'swr'
import { normalize } from 'viem/ens'

const provider = getProvider(CHAIN_ID.ETHEREUM)

export const fetchEnsIdentityRecords = async (
  ensName?: string
): Promise<ProfileIdentityRecords> => {
  if (!ensName) return {}

  try {
    const name = normalize(ensName)
    const [description, url, twitter] = await Promise.allSettled([
      provider.getEnsText({ name, key: 'description' }),
      provider.getEnsText({ name, key: 'url' }),
      provider.getEnsText({ name, key: 'com.twitter' }),
    ])

    return {
      description: description.status === 'fulfilled' ? description.value : undefined,
      url: url.status === 'fulfilled' ? url.value : undefined,
      twitter: twitter.status === 'fulfilled' ? twitter.value : undefined,
    }
  } catch (error) {
    console.warn('Profile ENS text records unavailable:', {
      ensName,
      error: error instanceof Error ? error.message : error,
    })

    return {}
  }
}

const fetchProfileIdentity = async ({
  ensName,
  profileAddress,
}: {
  ensName?: string
  profileAddress?: AddressType
}): Promise<ProfileIdentity> => {
  const [ensRecords, overrides] = await Promise.all([
    fetchEnsIdentityRecords(ensName),
    profileAddress ? getProfileLinkOverrides(profileAddress) : Promise.resolve([]),
  ])

  return getProfileIdentity({
    ensRecords,
    overrides,
  })
}

export const useProfileIdentity = (ensName?: string, profileAddress?: AddressType) => {
  return useSWR(
    ensName || profileAddress
      ? ([
          'profile-identity',
          ensName?.toLowerCase() ?? '',
          profileAddress?.toLowerCase() ?? '',
        ] as const)
      : null,
    ([, name, address]) =>
      fetchProfileIdentity({
        ensName: name || undefined,
        profileAddress: address ? (address as AddressType) : undefined,
      }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

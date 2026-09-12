import { PROFILE_LINK_EAS_CHAIN_ID } from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'
import { Hex, isAddress } from 'viem'

import { SDK } from '../client'

export type ProfileLinkKey = 'website' | 'x' | 'farcaster'

export type ProfileLinkOverride = {
  id: Hex
  key: ProfileLinkKey
  value: string
  timestamp: number
  creator: Hex
  revoked: boolean
}

const PROFILE_LINK_KEYS = new Set<ProfileLinkKey>(['website', 'x', 'farcaster'])

export async function getProfileLinkOverrides(
  profileAddress: string,
  chainId: CHAIN_ID = PROFILE_LINK_EAS_CHAIN_ID
): Promise<ProfileLinkOverride[]> {
  if (!isAddress(profileAddress)) {
    console.error('Invalid profile address')
    return []
  }

  // Profile links are only indexed on BASE/BASE_SEPOLIA
  if (chainId !== CHAIN_ID.BASE && chainId !== CHAIN_ID.BASE_SEPOLIA) {
    console.error('Profile links are only available on BASE or BASE_SEPOLIA')
    return []
  }

  try {
    const sdk = SDK.connect(chainId)
    const profile = profileAddress.toLowerCase()

    const response = await sdk.profileLinkOverrides(
      { address: profile },
      undefined,
      AbortSignal.timeout(10000)
    )

    const latestByKey = new Map<ProfileLinkKey, ProfileLinkOverride>()
    const seenKeys = new Set<ProfileLinkKey>()

    for (const override of response.profileLinkOverrides ?? []) {
      const key = override.key as ProfileLinkKey

      // Validate key type
      if (!PROFILE_LINK_KEYS.has(key)) continue
      if (seenKeys.has(key)) continue

      // Mark key as seen to prevent older records from becoming active
      seenKeys.add(key)

      // If the most recent attestation is revoked, treat it as a terminal state
      // (skip this key entirely - no override should be returned)
      if (override.revoked) continue

      // The newest empty attestation removes the Builder override for this key.
      // Omit it from the returned override list so ENS can be used normally.
      if (!override.value.trim()) continue

      latestByKey.set(key, {
        id: override.id as Hex,
        key,
        value: override.value,
        timestamp: Number(override.timestamp),
        creator: override.creator as Hex,
        revoked: false,
      })
    }

    return Array.from(latestByKey.values()).sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error(
      'Error fetching profile link overrides:',
      error instanceof Error ? error.message : String(error)
    )
    return []
  }
}

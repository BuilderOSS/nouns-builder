import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants'
import { PROFILE_LINK_EAS_CHAIN_ID } from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'
import { isChainIdSupportedByEAS } from '@buildeross/utils'
import { GraphQLClient, gql } from 'graphql-request'
import { Hex, isAddress } from 'viem'

export type ProfileLinkKey = 'website' | 'x' | 'farcaster'

export type ProfileLinkOverride = {
  id: Hex
  key: ProfileLinkKey
  value: string
  timestamp: number
  creator: Hex
  revoked: boolean
}

type ProfileLinkOverrideResponse = {
  profileLinkOverrides?: Array<{
    id: string
    key: string
    value: string
    timestamp: string | number
    creator: string
    revoked: boolean
  }>
}

const PROFILE_LINK_KEYS = new Set<ProfileLinkKey>(['website', 'x', 'farcaster'])

const PROFILE_LINK_OVERRIDES_QUERY = gql`
  query profileLinkOverrides($profile: Bytes!, $first: Int!, $skip: Int!) {
    profileLinkOverrides(
      where: { profile: $profile, revoked: false }
      orderBy: timestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      key
      value
      timestamp
      creator
      revoked
    }
  }
`

export async function getProfileLinkOverrides(
  profileAddress: string,
  chainId: CHAIN_ID = PROFILE_LINK_EAS_CHAIN_ID
): Promise<ProfileLinkOverride[]> {
  if (!isAddress(profileAddress)) {
    console.error('Invalid profile address')
    return []
  }

  if (!isChainIdSupportedByEAS(chainId)) {
    console.error('Chain ID not supported by EAS')
    return []
  }

  const subgraphUrl = PUBLIC_SUBGRAPH_URL.get(chainId)
  if (!subgraphUrl) {
    console.error('No subgraph URL found for profile link chain')
    return []
  }

  try {
    const client = new GraphQLClient(subgraphUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await client.request<ProfileLinkOverrideResponse>(
      PROFILE_LINK_OVERRIDES_QUERY,
      {
        profile: profileAddress.toLowerCase(),
        first: 1000,
        skip: 0,
      }
    )

    const latestByKey = new Map<ProfileLinkKey, ProfileLinkOverride>()

    for (const override of response.profileLinkOverrides ?? []) {
      const key = override.key.toLowerCase()
      if (!PROFILE_LINK_KEYS.has(key as ProfileLinkKey)) continue

      const typedKey = key as ProfileLinkKey
      if (latestByKey.has(typedKey)) continue

      latestByKey.set(typedKey, {
        id: override.id as Hex,
        key: typedKey,
        value: override.value,
        timestamp: Number(override.timestamp),
        creator: override.creator as Hex,
        revoked: override.revoked,
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

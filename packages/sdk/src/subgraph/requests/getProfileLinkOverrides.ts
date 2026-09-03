import {
  PROFILE_LINK_EAS_CHAIN_ID,
  PROFILE_LINK_SCHEMA_UID,
} from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'
import { isChainIdSupportedByEAS } from '@buildeross/utils'
import { gql, GraphQLClient } from 'graphql-request'
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

type EasDecodedField = {
  name?: string
  value?: {
    value?: unknown
  }
}

type ProfileLinkAttestationResponse = {
  attestations?: Array<{
    id: string
    attester: string
    recipient: string
    time: string | number
    decodedDataJson: string
    revoked: boolean
  }>
}

const PROFILE_LINK_KEYS = new Set<ProfileLinkKey>(['website', 'x', 'farcaster'])
const PROFILE_LINK_REQUEST_TIMEOUT_MS = 10_000

const PROFILE_LINK_EAS_GRAPHQL_URL: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.BASE]: 'https://base.easscan.org/graphql',
  [CHAIN_ID.BASE_SEPOLIA]: 'https://base-sepolia.easscan.org/graphql',
}

const PROFILE_LINK_ATTESTATIONS_QUERY = gql`
  query profileLinkAttestations($where: AttestationWhereInput) {
    attestations(where: $where, orderBy: { time: desc }) {
      id
      attester
      recipient
      time
      decodedDataJson
      revoked
    }
  }
`

const decodeProfileLinkAttestation = (
  decodedDataJson: string
): { key: ProfileLinkKey; value: string } | null => {
  try {
    const decoded = JSON.parse(decodedDataJson) as EasDecodedField[]
    const key = decoded.find((field) => field.name === 'key')?.value?.value
    const value = decoded.find((field) => field.name === 'value')?.value?.value

    if (typeof key !== 'string' || !PROFILE_LINK_KEYS.has(key as ProfileLinkKey))
      return null
    if (typeof value !== 'string') return null

    return { key: key as ProfileLinkKey, value }
  } catch {
    return null
  }
}

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

  const graphqlUrl = PROFILE_LINK_EAS_GRAPHQL_URL[chainId]
  if (!graphqlUrl) {
    console.error('No EAS GraphQL URL found for profile link chain')
    return []
  }

  try {
    const profile = profileAddress.toLowerCase()
    const client = new GraphQLClient(graphqlUrl, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(PROFILE_LINK_REQUEST_TIMEOUT_MS),
    })
    const response = await client.request<ProfileLinkAttestationResponse>(
      PROFILE_LINK_ATTESTATIONS_QUERY,
      {
        where: {
          attester: { equals: profile },
          recipient: { equals: profile },
          schemaId: { equals: PROFILE_LINK_SCHEMA_UID },
        },
      }
    )
    const latestByKey = new Map<ProfileLinkKey, ProfileLinkOverride>()
    const seenKeys = new Set<ProfileLinkKey>()

    for (const attestation of response.attestations ?? []) {
      if (attestation.revoked) continue
      if (attestation.attester.toLowerCase() !== profile) continue
      if (attestation.recipient.toLowerCase() !== profile) continue

      const link = decodeProfileLinkAttestation(attestation.decodedDataJson)
      if (!link || seenKeys.has(link.key)) continue

      // The newest empty attestation removes the Builder override for this key.
      // Mark it as seen so an older value cannot become active again, while
      // omitting it from the returned override list so ENS can be used normally.
      seenKeys.add(link.key)
      if (!link.value.trim()) continue

      latestByKey.set(link.key, {
        id: attestation.id as Hex,
        key: link.key,
        value: link.value,
        timestamp: Number(attestation.time),
        creator: attestation.attester as Hex,
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

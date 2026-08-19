import { CHAIN_ID } from '@buildeross/types'
import { Address, getAddress, isAddress, PublicClient, zeroAddress } from 'viem'
import { normalize } from 'viem/ens'

import {
  getBasename,
  getBasenameAddress,
  getBasenameAvatar,
  getReverseBasename,
} from './basename'
import { getProvider } from './provider'

const getDefaultProvider = () => getProvider(CHAIN_ID.ETHEREUM)

export type IsValidAddressResult = {
  data: boolean
  error?: string
}

/**
 * Checks if a string is a valid Ethereum address or a resolvable ENS name.
 */
export async function isValidAddress(
  input: string,
  provider?: PublicClient,
  errorMessage = 'Must be a valid Ethereum address or resolvable ENS name'
): Promise<IsValidAddressResult> {
  try {
    if (isAddress(input, { strict: false })) return { data: true }

    const resolved = await getEnsAddress(input, provider)
    return {
      data: !!resolved,
      error: resolved ? undefined : errorMessage,
    }
  } catch {
    return { data: false, error: errorMessage }
  }
}

/**
 * Checks if an address is valid and not the zero address
 */
function isValidNonZeroAddress(address: string | null | undefined): address is Address {
  return !!address && isAddress(address, { strict: false }) && address !== zeroAddress
}

// In-memory ENS resolution cache
const ensAddressCache = new Map<string, string | null>()

export async function getEnsAddress(
  nameOrAddress: string,
  provider?: PublicClient
): Promise<Address> {
  if (!nameOrAddress) return nameOrAddress as Address

  const resolvedProvider = provider ?? getDefaultProvider()

  if (isAddress(nameOrAddress, { strict: false })) return getAddress(nameOrAddress)

  const normalizedName = normalize(nameOrAddress)

  // Check cache
  if (ensAddressCache.has(normalizedName)) {
    return ensAddressCache.get(normalizedName)! as Address
  }

  try {
    // Priority 1: Check for ENS resolution on given chain
    const resolved = await resolvedProvider.getEnsAddress({ name: normalizedName })
    if (isValidNonZeroAddress(resolved)) {
      ensAddressCache.set(normalizedName, resolved)
      return resolved as Address
    }

    // Priority 2: Check for basename on Base L2
    const baseAddress = await getBasenameAddress(normalizedName)
    if (isValidNonZeroAddress(baseAddress)) {
      ensAddressCache.set(normalizedName, baseAddress)
      return baseAddress as Address
    }

    // Cache failure to avoid re-querying
    ensAddressCache.set(normalizedName, null)
    return normalizedName as Address
  } catch {
    // Cache failure to avoid re-querying
    ensAddressCache.set(normalizedName, null)
    return normalizedName as Address
  }
}

// In-memory reverse ENS cache
const ensNameCache = new Map<Address, string | null>()

/**
 * Verifies that a name resolves to the expected address
 */
async function verifyNameForAddress(
  name: string | null,
  expectedAddress: Address,
  provider?: PublicClient
): Promise<boolean> {
  if (!name) return false

  try {
    const resolvedAddress = await getEnsAddress(name, provider)
    return (
      isValidNonZeroAddress(resolvedAddress) &&
      getAddress(resolvedAddress) === expectedAddress
    )
  } catch {
    return false
  }
}

export async function getEnsName(
  address: Address,
  provider?: PublicClient
): Promise<string> {
  if (!address || !isAddress(address, { strict: false })) return address

  const resolvedProvider = provider ?? getDefaultProvider()

  const checksummedAddress = getAddress(address)

  // Check cache
  if (ensNameCache.has(checksummedAddress)) {
    return ensNameCache.get(checksummedAddress)!
  }

  try {
    // Priority 1: Try ENS resolution on given chain
    const ensName = await resolvedProvider.getEnsName({ address: checksummedAddress })
    if (await verifyNameForAddress(ensName, checksummedAddress, resolvedProvider)) {
      ensNameCache.set(checksummedAddress, ensName!)
      return ensName!
    }

    // Priority 2: Try reverse name from base L2 resolver
    const basename = await getBasename(checksummedAddress)
    if (await verifyNameForAddress(basename, checksummedAddress, resolvedProvider)) {
      ensNameCache.set(checksummedAddress, basename!)
      return basename!
    }

    // Priority 3: Try reverse name from base L2 reverse registrar
    const reverseBasename = await getReverseBasename(checksummedAddress)
    if (
      await verifyNameForAddress(reverseBasename, checksummedAddress, resolvedProvider)
    ) {
      ensNameCache.set(checksummedAddress, reverseBasename!)
      return reverseBasename!
    }

    // Cache failure to avoid re-querying
    ensNameCache.set(checksummedAddress, null)
    return checksummedAddress
  } catch {
    // Cache failure to avoid re-querying
    ensNameCache.set(checksummedAddress, null)
    return checksummedAddress
  }
}

// In-memory ENS to avatar cache
const avatarCache = new Map<string, string | null>()

export async function getEnsAvatar(
  name: string,
  provider?: PublicClient
): Promise<string | null> {
  if (!name) return null

  const resolvedProvider = provider ?? getDefaultProvider()

  // Check cache
  if (avatarCache.has(name)) {
    return avatarCache.get(name)!
  }

  try {
    // Priority 1: Check for avatar on given chain
    const ensAvatar = await resolvedProvider.getEnsAvatar({ name })
    if (ensAvatar) {
      avatarCache.set(name, ensAvatar)
      return ensAvatar
    }

    // Priority 2: Check for avatar on Base L2
    const baseAvatar = await getBasenameAvatar(name)
    if (baseAvatar) {
      avatarCache.set(name, baseAvatar)
      return baseAvatar
    }

    avatarCache.set(name, null)
    return null
  } catch {
    return null
  }
}

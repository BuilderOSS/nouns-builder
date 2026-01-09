import { CHAIN_ID } from '@buildeross/types'
import { Address, getAddress, isAddress, PublicClient, zeroAddress } from 'viem'

import {
  getBasename,
  getBasenameAddress,
  getBasenameAvatar,
  getReverseBasename,
} from './basename'
import { getProvider } from './provider'

const defaultProvider = getProvider(CHAIN_ID.ETHEREUM)

export type IsValidAddressResult = {
  data: boolean
  error?: string
}

/**
 * Checks if a string is a valid Ethereum address or a resolvable ENS name.
 */
export async function isValidAddress(
  input: string,
  provider: PublicClient | undefined = defaultProvider,
  errorMessage = 'Must be a valid Ethereum address or resolvable ENS name'
): Promise<IsValidAddressResult> {
  try {
    if (isAddress(input, { strict: false })) return { data: true }

    const resolved = await provider?.getEnsAddress({ name: input })
    return {
      data: !!resolved,
      error: resolved ? undefined : errorMessage,
    }
  } catch {
    return { data: false, error: errorMessage }
  }
}

// In-memory ENS resolution cache
const ensAddressCache = new Map<string, string>()

export async function getEnsAddress(
  nameOrAddress: string,
  provider: PublicClient | undefined = defaultProvider
): Promise<Address> {
  if (!nameOrAddress) return nameOrAddress as Address

  if (isAddress(nameOrAddress, { strict: false })) return getAddress(nameOrAddress)

  // Check cache
  if (ensAddressCache.has(nameOrAddress)) {
    return ensAddressCache.get(nameOrAddress)! as Address
  }

  try {
    // Priority 1: Check for basename on Base L2
    const baseAddress = await getBasenameAddress(nameOrAddress)
    if (
      baseAddress &&
      isAddress(baseAddress, { strict: false }) &&
      baseAddress !== zeroAddress
    ) {
      ensAddressCache.set(nameOrAddress, baseAddress)
      return baseAddress as Address
    }

    // Priority 2: Fall back to ENS resolution on mainnet
    const resolved = await provider.getEnsAddress({ name: nameOrAddress })
    if (resolved && isAddress(resolved, { strict: false }) && resolved !== zeroAddress) {
      ensAddressCache.set(nameOrAddress, resolved)
      return resolved as Address
    }
    return nameOrAddress as Address
  } catch (e) {
    console.error('Error getting ENS address:', e)
    return nameOrAddress as Address
  }
}

// In-memory reverse ENS cache
const ensNameCache = new Map<Address, string | null>()

export async function getEnsName(
  address: Address,
  provider: PublicClient | undefined = defaultProvider
): Promise<string> {
  if (!address || !isAddress(address, { strict: false })) return address

  const checksummedAddress = getAddress(address)

  // Check cache
  if (ensNameCache.has(checksummedAddress)) {
    return ensNameCache.get(checksummedAddress)!
  }

  try {
    // Priority 1: Check for basename on Base L2
    const basename = await getBasename(checksummedAddress)
    if (basename) {
      ensNameCache.set(checksummedAddress, basename)
      return basename
    }

    // Priority 2: Check for reverse resolution on Base L2
    const reverse = await getReverseBasename(checksummedAddress)
    if (reverse) {
      ensNameCache.set(checksummedAddress, reverse)
      return reverse
    }

    // Priority 3: Fall back to ENS resolution on mainnet
    const name = await provider.getEnsName({ address: checksummedAddress })
    const result = name ?? checksummedAddress
    ensNameCache.set(checksummedAddress, result)
    return result
  } catch (e) {
    console.error('Error getting ENS name:', e)
    return checksummedAddress
  }
}

// In-memory ENS to avatar cache
const avatarCache = new Map<string, string | null>()

export async function getEnsAvatar(
  name: string,
  provider: PublicClient | undefined = defaultProvider
): Promise<string | null> {
  if (!name) return null

  // Check cache
  if (avatarCache.has(name)) {
    return avatarCache.get(name)!
  }

  try {
    // Priority 1: Check for avatar on Base L2
    const baseAvatar = await getBasenameAvatar(name)
    if (baseAvatar) {
      avatarCache.set(name, baseAvatar)
      return baseAvatar
    }

    // Priority 2: Fall back to ENS resolution on mainnet
    const avatar = await provider.getEnsAvatar({ name })
    const result = avatar ?? null
    avatarCache.set(name, result)
    return result
  } catch (e) {
    console.error('Error getting avatar:', e)
    return null
  }
}

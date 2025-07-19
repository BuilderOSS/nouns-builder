import { getProvider } from './provider'
import { CHAIN_ID } from '@buildeross/types'
import { Address, PublicClient, isAddress } from 'viem'

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
  errorMessage = 'Must be a valid Ethereum address or resolvable ENS name',
): Promise<IsValidAddressResult> {
  try {
    if (isAddress(input)) return { data: true }

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
  provider: PublicClient | undefined = defaultProvider,
): Promise<Address> {
  if (!nameOrAddress) return nameOrAddress as Address

  if (isAddress(nameOrAddress)) return nameOrAddress as Address

  // Check cache
  if (ensAddressCache.has(nameOrAddress)) {
    return ensAddressCache.get(nameOrAddress)! as Address
  }

  try {
    const resolved = await provider.getEnsAddress({ name: nameOrAddress })
    const result = resolved ?? nameOrAddress
    ensAddressCache.set(nameOrAddress, result)
    return result as Address
  } catch (e) {
    console.error('Error getting ENS address:', e)
    return nameOrAddress as Address
  }
}

// In-memory reverse ENS cache
const ensNameCache = new Map<Address, string | null>()

export async function getEnsName(
  address: Address,
  provider: PublicClient | undefined = defaultProvider,
): Promise<string> {
  if (!address) return address

  // Check cache
  if (ensNameCache.has(address)) {
    return ensNameCache.get(address)!
  }

  try {
    const name = await provider.getEnsName({ address })
    const result = name ?? address
    ensNameCache.set(address, result)
    return result
  } catch (e) {
    console.error('Error getting ENS name:', e)
    return address
  }
}

// In-memory ENS to avatar cache
const avatarCache = new Map<string, string | null>()

export async function getEnsAvatar(
  name: string,
  provider: PublicClient | undefined = defaultProvider,
): Promise<string | null> {
  if (!name) return null

  // Check cache
  if (avatarCache.has(name)) {
    return avatarCache.get(name)!
  }

  try {
    const avatar = await provider.getEnsAvatar({ name })
    const result = avatar ?? null
    avatarCache.set(name, result)
    return result
  } catch (e) {
    console.error('Error getting avatar:', e)
    return null
  }
}

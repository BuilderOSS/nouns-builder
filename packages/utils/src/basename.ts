import { CHAIN_ID } from '@buildeross/types'
import {
  Address,
  encodePacked,
  getAddress,
  isAddress,
  keccak256,
  namehash,
  PublicClient,
  zeroAddress,
} from 'viem'
import { normalize, parseAvatarRecord } from 'viem/ens'

import L2ResolverAbi from './abis/L2ResolverAbi'
import L2ReverseRegistrarAbi from './abis/L2ReverseRegistrarAbi'
import { getProvider } from './provider'

/**
 * Checks if an address is valid and not the zero address
 */
function isValidNonZeroAddress(address: string | null | undefined): address is Address {
  return !!address && isAddress(address, { strict: false }) && address !== zeroAddress
}

export const BASENAME_L2_RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD'
export const BASENAME_L2_RESOLVER_ADDRESS_UPGRADEABLE_PROXY =
  '0x426fA03fB86E510d0Dd9F70335Cf102a98b10875'
export const L2_REVERSE_REGISTRAR_ADDRESS = '0x0000000000D8e504002cC26E3Ec46D81971C1664'

const baseProvider = getProvider(CHAIN_ID.BASE)

/**
 * Converts a chain ID to its coin type for ENS resolution
 * Following ENSIP-19 specification for L2 name resolution
 */
export const convertChainIdToCoinType = (chainId: CHAIN_ID): string => {
  if (chainId === CHAIN_ID.ETHEREUM) {
    return 'addr'
  }

  const cointype = (0x80000000 | chainId) >>> 0
  return cointype.toString(16)
}

/**
 * Converts an address and chain ID to a reverse node for ENS resolution
 * This creates the namehash for reverse resolution lookups
 */
export const convertReverseNodeToBytes = (
  address: Address,
  chainId: number = CHAIN_ID.BASE
) => {
  const addressFormatted = address.toLowerCase() as Address
  const addressNode = keccak256(addressFormatted)
  const chainCoinType = convertChainIdToCoinType(chainId)
  const baseReverseNode = namehash(`${chainCoinType}.reverse`)
  const addressReverseNode = keccak256(
    encodePacked(['bytes32', 'bytes32'], [baseReverseNode, addressNode])
  )
  return addressReverseNode
}

// Cache for basename lookups
const basenameCache = new Map<Address, string | null>()

/**
 * Resolves a wallet address to its basename on Base L2
 * Returns the basename string (e.g., "username.base.eth") or null if not found
 */
export async function getBasename(
  address: Address,
  provider: PublicClient | undefined = baseProvider
): Promise<string | null> {
  if (!address || !isAddress(address, { strict: false })) return null

  const checksummedAddress = getAddress(address)

  // Check cache
  if (basenameCache.has(checksummedAddress)) {
    return basenameCache.get(checksummedAddress)!
  }

  try {
    const addressReverseNode = convertReverseNodeToBytes(
      checksummedAddress,
      CHAIN_ID.BASE
    )

    // Priority 1: Upgradeable Proxy
    const proxyBasename = await provider.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS_UPGRADEABLE_PROXY,
      functionName: 'name',
      args: [addressReverseNode],
    })

    if (proxyBasename) {
      const result = proxyBasename as string
      basenameCache.set(checksummedAddress, result)
      return result
    }

    // Priority 2: L2 Resolver
    const basename = (await provider.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'name',
      args: [addressReverseNode],
    })) as string

    const result = basename || null
    basenameCache.set(checksummedAddress, result)
    return result
  } catch {
    basenameCache.set(checksummedAddress, null)
    return null
  }
}

// Cache for reverse basename lookups
const basenameReverseNameCache = new Map<string, string | null>()

/**
 * Resolves a wallet address to its reverse basename on Base L2
 * Returns the reverse basename string (e.g., "username.base.eth") or null if not found
 */
export async function getReverseBasename(
  address: Address,
  provider: PublicClient | undefined = baseProvider
): Promise<string | null> {
  if (!address || !isAddress(address, { strict: false })) return null

  const checksummedAddress = getAddress(address)

  // Check cache
  if (basenameReverseNameCache.has(checksummedAddress)) {
    return basenameReverseNameCache.get(checksummedAddress)!
  }

  try {
    const reverseBasename = (await provider.readContract({
      abi: L2ReverseRegistrarAbi,
      address: L2_REVERSE_REGISTRAR_ADDRESS,
      functionName: 'nameForAddr',
      args: [checksummedAddress],
    })) as string

    const result = reverseBasename || null
    basenameReverseNameCache.set(checksummedAddress, result)
    return result
  } catch {
    return null
  }
}

// Cache for basename to address lookups
const basenameAddressCache = new Map<string, Address | null>()

/**
 * Resolves a basename to its wallet address on Base L2
 * Returns the address or null if the basename doesn't exist
 */
export async function getBasenameAddress(
  basename: string,
  provider: PublicClient | undefined = baseProvider
): Promise<Address | null> {
  if (!basename) return null

  const normalizedBasename = normalize(basename)

  // Check cache
  if (basenameAddressCache.has(normalizedBasename)) {
    return basenameAddressCache.get(normalizedBasename)!
  }

  try {
    // Priority 1: Upgradeable Proxy
    const proxyAddress = await provider.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS_UPGRADEABLE_PROXY,
      functionName: 'addr',
      args: [namehash(normalizedBasename)],
    })

    if (isValidNonZeroAddress(proxyAddress)) {
      const result = getAddress(proxyAddress)
      basenameAddressCache.set(normalizedBasename, result)
      return result
    }

    // Priority 2: L2 Resolver
    const resolved = (await provider.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      args: [namehash(normalizedBasename)],
      functionName: 'addr',
    })) as string

    if (isValidNonZeroAddress(resolved)) {
      const result = getAddress(resolved)
      basenameAddressCache.set(normalizedBasename, result)
      return result
    }

    basenameAddressCache.set(normalizedBasename, null)
    return null
  } catch {
    return null
  }
}

// Cache for basename avatar lookups
const basenameAvatarCache = new Map<string, string | null>()

/**
 * Retrieves the avatar for a basename
 * Returns the avatar URL or null if not set
 */
export async function getBasenameAvatar(
  basename: string,
  provider: PublicClient | undefined = baseProvider
): Promise<string | null> {
  if (!basename) return null

  const normalizedBasename = normalize(basename)

  // Check cache
  if (basenameAvatarCache.has(normalizedBasename)) {
    return basenameAvatarCache.get(normalizedBasename)!
  }

  try {
    // Priority 1: Upgradeable Proxy
    const proxyAvatarRecord = await provider.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS_UPGRADEABLE_PROXY,
      functionName: 'text',
      args: [namehash(normalizedBasename), 'avatar'],
    })

    if (proxyAvatarRecord) {
      const avatar = await parseAvatarRecord(provider, { record: proxyAvatarRecord })
      const result = avatar || null
      basenameAvatarCache.set(normalizedBasename, result)
      return result
    }

    // Priority 2: L2 Resolver
    const avatarRecord = (await provider.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      args: [namehash(normalizedBasename), 'avatar'],
      functionName: 'text',
    })) as string

    if (!avatarRecord) {
      basenameAvatarCache.set(normalizedBasename, null)
      return null
    }

    const avatar = await parseAvatarRecord(provider, { record: avatarRecord })
    const result = avatar || null
    basenameAvatarCache.set(normalizedBasename, result)
    return result
  } catch {
    return null
  }
}

/**
 * Checks if a string is a basename (ends with .base.eth)
 */
export function isBasename(name: string): boolean {
  return normalize(name).toLowerCase().endsWith('.base.eth')
}

export async function verifyBasenameForAddress(
  address: Address,
  candidateName: string
): Promise<string | null> {
  try {
    const normalized = normalize(candidateName)
    if (!isBasename(normalized)) return null

    const resolved = await getBasenameAddress(normalized)
    if (!resolved) return null

    return getAddress(resolved) === getAddress(address) ? normalized : null
  } catch {
    return null
  }
}

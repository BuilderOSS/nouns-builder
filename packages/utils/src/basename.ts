import { CHAIN_ID } from '@buildeross/types'
import {
  Address,
  encodePacked,
  getAddress,
  isAddress,
  keccak256,
  namehash,
  PublicClient,
} from 'viem'

import L2ResolverAbi from './abis/L2ResolverAbi'
import { getProvider } from './provider'

export const BASENAME_L2_RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD'

const baseProvider = getProvider(CHAIN_ID.BASE)

/**
 * Converts a chain ID to its coin type for ENS resolution
 * Following ENSIP-19 specification for L2 name resolution
 */
export function convertChainIdToCoinType(chainId: number): string {
  // For mainnet (chainId 1), use 'addr' field
  if (chainId === CHAIN_ID.ETHEREUM) {
    return 'addr'
  }

  // For L2s, use the ENSIP-11 coin type encoding:
  // coinType = 0x80000000 | chainId
  const coinType = (0x80000000 | chainId) >>> 0
  return `0x${coinType.toString(16)}`
}

/**
 * Converts an address and chain ID to a reverse node for ENS resolution
 * This creates the namehash for reverse resolution lookups
 */
export function convertReverseNodeToBytes(
  address: Address,
  chainId: number = CHAIN_ID.BASE
): `0x${string}` {
  // Normalize address to lowercase without 0x prefix
  const addressFormatted = address.toLowerCase().replace('0x', '') as `0x${string}`

  // Generate the reverse record namehash
  const addressHash = keccak256(`0x${addressFormatted}`)
  const coinType = convertChainIdToCoinType(chainId)

  // Build the reverse resolution node
  // Format: keccak256(namehash(reverse) + keccak256(coinType) + keccak256(address))
  const reverseNode = namehash(`${coinType}.reverse`)
  const addressNode = keccak256(
    encodePacked(['bytes32', 'bytes32'], [reverseNode, addressHash])
  )

  return addressNode
}

// In-memory basename cache
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

    const basename = (await provider.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'name',
      args: [addressReverseNode],
    })) as string

    const result = basename || null
    basenameCache.set(checksummedAddress, result)
    return result
  } catch (e) {
    console.error('Error getting basename:', e)
    basenameCache.set(checksummedAddress, null)
    return null
  }
}

// In-memory basename address cache
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

  const normalizedBasename = basename.toLowerCase()

  // Check cache
  if (basenameAddressCache.has(normalizedBasename)) {
    return basenameAddressCache.get(normalizedBasename)!
  }

  try {
    // Get the address for the basename using viem's built-in ENS resolution
    // Basenames work through ENSIP-10 and are compatible with ENS resolution
    const resolved = await provider.getEnsAddress({ name: normalizedBasename })

    const result = resolved ? getAddress(resolved) : null
    basenameAddressCache.set(normalizedBasename, result)
    return result
  } catch (e) {
    console.error('Error getting basename address:', e)
    basenameAddressCache.set(normalizedBasename, null)
    return null
  }
}

// In-memory basename avatar cache
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

  const normalizedBasename = basename.toLowerCase()

  // Check cache
  if (basenameAvatarCache.has(normalizedBasename)) {
    return basenameAvatarCache.get(normalizedBasename)!
  }

  try {
    // Use viem's getEnsAvatar which works with basenames via ENSIP-10
    const avatar = await provider.getEnsAvatar({ name: normalizedBasename })

    const result = avatar ?? null
    basenameAvatarCache.set(normalizedBasename, result)
    return result
  } catch (e) {
    console.error('Error getting basename avatar:', e)
    basenameAvatarCache.set(normalizedBasename, null)
    return null
  }
}

/**
 * Checks if a string is a basename (ends with .base.eth)
 */
export function isBasename(name: string): boolean {
  return name.toLowerCase().endsWith('.base.eth')
}

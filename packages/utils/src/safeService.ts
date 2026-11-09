import { SAFE_SERVICE_URL } from '@buildeross/constants/safe'
import { CHAIN_ID } from '@buildeross/types'
import debug from 'debug'
import type { Address } from 'viem'

import type { SafeInfo } from './providers/types'

const debugSafe = debug('app:safe')

// Re-export SafeInfo for backwards compatibility
export type { SafeInfo }

export interface SafeDelegate {
  delegate: Address
  delegator: Address
  label: string
  safe: Address
}

export interface DelegatesResponse {
  count: number
  next: string | null
  previous: string | null
  results: SafeDelegate[]
}

export interface SafeApiResponse {
  address: Address
  nonce: number
  threshold: number
  owners: Address[]
  masterCopy: Address
  modules: Address[]
  fallbackHandler: Address
  guard: Address
  version: string
}

// Cache for delegation checks to avoid excessive API calls
const delegateCache = new Map<string, { isDelegate: boolean; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Check if an address is a delegate for a given Safe
 */
export async function isDelegateForSafe(
  delegateAddress: Address,
  safeAddress: Address,
  chainId: CHAIN_ID
): Promise<boolean> {
  const baseUrl = SAFE_SERVICE_URL[chainId]
  if (!baseUrl) {
    console.warn(`Safe Service not available for chain ${chainId}`)
    return false
  }

  // Check cache first
  const cacheKey = `${chainId}-${safeAddress}-${delegateAddress}`
  const cached = delegateCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.isDelegate
  }

  try {
    const url = `${baseUrl}/api/v1/safes/${safeAddress}/delegates/?delegate=${delegateAddress}`
    const response = await fetch(url)

    if (!response.ok) {
      debugSafe(`Safe API error: ${response.status}`, await response.text())
      return false
    }

    const data: DelegatesResponse = await response.json()
    const isDelegate = data.count > 0

    // Cache the result
    delegateCache.set(cacheKey, { isDelegate, timestamp: Date.now() })

    return isDelegate
  } catch (error) {
    debugSafe('Error checking delegate status:', error)
    return false
  }
}

/**
 * Get all Safes that an address is a delegate for
 */
export async function getSafesForDelegate(
  delegateAddress: Address,
  chainId: CHAIN_ID
): Promise<Address[]> {
  const baseUrl = SAFE_SERVICE_URL[chainId]
  if (!baseUrl) {
    console.warn(`Safe Service not available for chain ${chainId}`)
    return []
  }

  try {
    const url = `${baseUrl}/api/v1/delegates/?delegate=${delegateAddress}`
    const response = await fetch(url)

    if (!response.ok) {
      debugSafe(`Safe API error: ${response.status}`, await response.text())
      return []
    }

    const data: DelegatesResponse = await response.json()
    return data.results.map((d) => d.safe as Address)
  } catch (error) {
    debugSafe('Error fetching Safes for delegate:', error)
    return []
  }
}

/**
 * Thrown when the Safe Transaction Service could not answer (network error,
 * rate limit, 5xx). Distinct from "this Safe doesn't exist", so callers don't
 * mistake an outage for a missing Safe or a non-owner.
 */
export class SafeServiceError extends Error {
  readonly status?: number

  constructor(message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause })
    this.name = 'SafeServiceError'
    this.status = options?.status
  }
}

/**
 * True for a SafeServiceError. Also matches by name, so the check still works
 * if this module is bundled into more than one entry point (each with its own
 * copy of the class).
 */
export function isSafeServiceError(error: unknown): error is SafeServiceError {
  return (
    error instanceof SafeServiceError ||
    (error instanceof Error && error.name === 'SafeServiceError')
  )
}

/**
 * Look up a Safe. Resolves to null when the Safe doesn't exist (404, or the
 * chain has no Safe service), and throws SafeServiceError when the service
 * could not answer.
 */
export async function lookupSafeInfo(
  safeAddress: Address,
  chainId: CHAIN_ID
): Promise<SafeInfo | null> {
  const baseUrl = SAFE_SERVICE_URL[chainId]
  if (!baseUrl) {
    console.warn(`Safe Service not available for chain ${chainId}`)
    return null
  }

  let response: Response
  try {
    response = await fetch(`${baseUrl}/api/v1/safes/${safeAddress}/`)
  } catch (error) {
    debugSafe('Error fetching Safe info:', error)
    throw new SafeServiceError('Safe service request failed', { cause: error })
  }

  if (response.status === 404) return null

  if (!response.ok) {
    debugSafe(`Safe API error: ${response.status}`, await response.text().catch(() => ''))
    throw new SafeServiceError(`Safe service responded with ${response.status}`, {
      status: response.status,
    })
  }

  let data: SafeApiResponse
  try {
    data = await response.json()
  } catch (error) {
    throw new SafeServiceError('Safe service returned an invalid response', {
      cause: error,
    })
  }

  // Transform API response to SafeInfo format
  return {
    safeAddress,
    chainId,
    threshold: data.threshold,
    owners: data.owners,
    isReadOnly: false,
    nonce: data.nonce,
    version: data.version,
  }
}

/**
 * Get Safe information including owners. Returns null both when the Safe
 * doesn't exist and when the lookup failed; use lookupSafeInfo to tell the
 * two apart.
 */
export async function getSafeInfo(
  safeAddress: Address,
  chainId: CHAIN_ID
): Promise<SafeInfo | null> {
  try {
    return await lookupSafeInfo(safeAddress, chainId)
  } catch {
    return null
  }
}

/**
 * Check if an address is a valid Safe.
 * Throws SafeServiceError if the Safe service could not answer.
 */
export async function isSafeAddress(
  address: Address,
  chainId: CHAIN_ID
): Promise<boolean> {
  const safeInfo = await lookupSafeInfo(address, chainId)
  return safeInfo !== null
}

/**
 * Get list of owners for a Safe ([] if the Safe doesn't exist).
 * Throws SafeServiceError if the Safe service could not answer.
 */
export async function getSafeOwners(
  safeAddress: Address,
  chainId: CHAIN_ID
): Promise<Address[]> {
  const safeInfo = await lookupSafeInfo(safeAddress, chainId)
  return safeInfo?.owners || []
}

/**
 * Check if an address is an owner of a given Safe.
 * Throws SafeServiceError if the Safe service could not answer, so an outage
 * or rate limit is never reported as "not an owner".
 */
export async function isOwnerOfSafe(
  ownerAddress: Address,
  safeAddress: Address,
  chainId: CHAIN_ID
): Promise<boolean> {
  const owners = await getSafeOwners(safeAddress, chainId)
  return owners.some((owner) => owner.toLowerCase() === ownerAddress.toLowerCase())
}

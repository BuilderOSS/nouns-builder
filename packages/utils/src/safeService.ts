import { SAFE_SERVICE_URL } from '@buildeross/constants/safe'
import { CHAIN_ID } from '@buildeross/types'
import type { Address } from 'viem'

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
      console.error(`Safe API error: ${response.status}`, await response.text())
      return false
    }

    const data: DelegatesResponse = await response.json()
    const isDelegate = data.count > 0

    // Cache the result
    delegateCache.set(cacheKey, { isDelegate, timestamp: Date.now() })

    return isDelegate
  } catch (error) {
    console.error('Error checking delegate status:', error)
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
      console.error(`Safe API error: ${response.status}`, await response.text())
      return []
    }

    const data: DelegatesResponse = await response.json()
    return data.results.map((d) => d.safe as Address)
  } catch (error) {
    console.error('Error fetching Safes for delegate:', error)
    return []
  }
}

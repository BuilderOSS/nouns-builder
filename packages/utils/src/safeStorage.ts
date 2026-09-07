import type { Address } from 'viem'
import { getAddress, isAddress } from 'viem'

import type { SafeInfo } from './providers/types'

const STORAGE_KEY = 'safe-info'

export interface SavedSafeInfo {
  safeAddress: Address
  chainId: number
  eoaConnectorId: string
  eoaAddress?: Address
  threshold: number
  owners: Address[]
  nonce?: number
  version?: string
  timestamp: number
}

/**
 * Get saved Safe information from localStorage
 */
export function getSavedSafeInfo(): SavedSafeInfo | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored) as Partial<SavedSafeInfo>
    const safeAddress = parsed.safeAddress
    const owners = parsed.owners
    if (
      typeof safeAddress !== 'string' ||
      !isAddress(safeAddress) ||
      typeof parsed.chainId !== 'number' ||
      !Number.isInteger(parsed.chainId) ||
      typeof parsed.eoaConnectorId !== 'string' ||
      !parsed.eoaConnectorId ||
      (parsed.eoaAddress !== undefined &&
        (typeof parsed.eoaAddress !== 'string' || !isAddress(parsed.eoaAddress))) ||
      typeof parsed.threshold !== 'number' ||
      !Array.isArray(owners) ||
      !owners.every((owner) => typeof owner === 'string' && isAddress(owner)) ||
      typeof parsed.timestamp !== 'number'
    ) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return {
      ...parsed,
      safeAddress: getAddress(safeAddress),
      eoaAddress: parsed.eoaAddress ? getAddress(parsed.eoaAddress) : undefined,
      owners: owners.map((owner) => getAddress(owner as string)),
    } as SavedSafeInfo
  } catch (error) {
    console.error('Error reading saved Safe info:', error)
    return null
  }
}

/**
 * Save Safe information to localStorage
 */
export function setSafeInfo(
  safeInfo: SafeInfo,
  eoaConnectorId: string,
  eoaAddress?: Address | null
): void {
  if (typeof window === 'undefined') return

  try {
    const data: SavedSafeInfo = {
      safeAddress: safeInfo.safeAddress,
      chainId: safeInfo.chainId,
      eoaConnectorId,
      eoaAddress:
        eoaAddress && isAddress(eoaAddress) ? getAddress(eoaAddress) : undefined,
      threshold: safeInfo.threshold,
      owners: safeInfo.owners,
      nonce: safeInfo.nonce,
      version: safeInfo.version,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving Safe info:', error)
  }
}

/**
 * Clear saved Safe information
 */
export function clearSafeInfo(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing Safe info:', error)
  }
}

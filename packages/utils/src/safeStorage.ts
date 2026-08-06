import type { Address } from 'viem'

import type { SafeInfo } from './providers/types'

const STORAGE_KEY = 'safe-info'

export interface SavedSafeInfo {
  safeAddress: Address
  chainId: number
  eoaConnectorId: string
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

    const parsed: SavedSafeInfo = JSON.parse(stored)
    return parsed
  } catch (error) {
    console.error('Error reading saved Safe info:', error)
    return null
  }
}

/**
 * Save Safe information to localStorage
 */
export function setSafeInfo(safeInfo: SafeInfo, eoaConnectorId: string): void {
  if (typeof window === 'undefined') return

  try {
    const data: SavedSafeInfo = {
      safeAddress: safeInfo.safeAddress,
      chainId: safeInfo.chainId,
      eoaConnectorId,
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

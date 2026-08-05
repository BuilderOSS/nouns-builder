import type { Address } from 'viem'

const STORAGE_KEY = 'safe-info'

export interface SavedSafeInfo {
  safeAddress: Address
  chainId: number
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
export function setSafeInfo(safeAddress: Address, chainId: number): void {
  if (typeof window === 'undefined') return

  try {
    const data: SavedSafeInfo = {
      safeAddress,
      chainId,
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

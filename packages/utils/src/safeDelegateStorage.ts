import type { Address } from 'viem'

const STORAGE_KEY = 'safe-delegate-info'

export interface SavedSafeDelegate {
  safeAddress: Address
  chainId: number
  timestamp: number
}

/**
 * Get saved Safe delegate information from localStorage
 */
export function getSavedSafeDelegate(): SavedSafeDelegate | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed: SavedSafeDelegate = JSON.parse(stored)
    return parsed
  } catch (error) {
    console.error('Error reading saved Safe delegate:', error)
    return null
  }
}

/**
 * Save Safe delegate information to localStorage
 */
export function setSafeDelegate(safeAddress: Address, chainId: number): void {
  if (typeof window === 'undefined') return

  try {
    const data: SavedSafeDelegate = {
      safeAddress,
      chainId,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving Safe delegate:', error)
  }
}

/**
 * Clear saved Safe delegate information
 */
export function clearSafeDelegate(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing Safe delegate:', error)
  }
}

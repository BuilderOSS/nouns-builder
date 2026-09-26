import type { Address } from 'viem'
import { getAddress, isAddress } from 'viem'

import type { SafeInfo } from './providers/types'

const STORAGE_KEY = 'safe-info'

export interface SavedSafeInfo {
  safeAddress: Address
  chainId: number
  ownerConnectorId: string
  ownerAddress?: Address
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

    const { eoaAddress, eoaConnectorId, ...current } = JSON.parse(
      stored
    ) as Partial<SavedSafeInfo> & {
      eoaAddress?: unknown
      eoaConnectorId?: unknown
    }
    const parsed = {
      ...current,
      ownerConnectorId:
        current.ownerConnectorId === undefined
          ? eoaConnectorId
          : current.ownerConnectorId,
      ownerAddress:
        current.ownerAddress === undefined ? eoaAddress : current.ownerAddress,
    }
    const safeAddress = parsed.safeAddress
    const owners = parsed.owners
    if (
      typeof safeAddress !== 'string' ||
      !isAddress(safeAddress) ||
      typeof parsed.chainId !== 'number' ||
      !Number.isInteger(parsed.chainId) ||
      typeof parsed.ownerConnectorId !== 'string' ||
      !parsed.ownerConnectorId ||
      (parsed.ownerAddress !== undefined &&
        (typeof parsed.ownerAddress !== 'string' || !isAddress(parsed.ownerAddress))) ||
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
      ownerAddress: parsed.ownerAddress ? getAddress(parsed.ownerAddress) : undefined,
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
  ownerConnectorId: string,
  ownerAddress?: Address | null
): void {
  if (typeof window === 'undefined') return

  try {
    const data: SavedSafeInfo = {
      safeAddress: safeInfo.safeAddress,
      chainId: safeInfo.chainId,
      ownerConnectorId,
      ownerAddress:
        ownerAddress && isAddress(ownerAddress) ? getAddress(ownerAddress) : undefined,
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

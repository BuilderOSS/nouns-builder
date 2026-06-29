import { AddressType } from '@buildeross/types'
import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DismissedUrgencyAlertsState {
  dismissedIds: string[]
  dismissAlert: (id: string) => void
}

// Helper to get the network type from environment
const getNetworkType = () => {
  if (typeof window === 'undefined') return 'mainnet'
  const nextPublicNetworkType = (window as any).__NEXT_PUBLIC_NETWORK_TYPE__
  return nextPublicNetworkType || process.env.NEXT_PUBLIC_NETWORK_TYPE || 'mainnet'
}

// Create a scoped storage key
export const getDismissedAlertsStorageKey = (walletAddress?: AddressType) => {
  const networkType = getNetworkType()
  const baseKey = `nouns-builder-dismissed-urgency-alerts:${networkType}`

  if (walletAddress) {
    return `${baseKey}:${walletAddress.toLowerCase()}`
  }

  // Fallback to temp key if wallet not connected yet
  return `${baseKey}:temp`
}

// Module-level cache: stores are cached by storageKey to ensure
// the same store instance is reused across renders and component mounts
const storeCache = new Map<string, ReturnType<typeof createDismissedAlertsStore>>()

// Store factory: creates a store instance with a specific storage key
function createDismissedAlertsStore(storageKey: string) {
  return createStore<DismissedUrgencyAlertsState>()(
    persist(
      (set) => ({
        dismissedIds: [],
        dismissAlert: (id) =>
          set((state) =>
            state.dismissedIds.includes(id)
              ? state
              : { dismissedIds: [...state.dismissedIds, id] }
          ),
      }),
      {
        name: 'nouns-builder-dismissed-urgency-alerts', // Base name, actual key is dynamic
        version: 1,
        storage: {
          getItem: () => {
            if (typeof window === 'undefined') return null
            // Use the scoped storage key for this store instance
            const str = sessionStorage.getItem(storageKey)
            if (!str) return null
            return JSON.parse(str)
          },
          setItem: (_name, value) => {
            if (typeof window === 'undefined') return
            // Use the scoped storage key for this store instance
            sessionStorage.setItem(storageKey, JSON.stringify(value))
          },
          removeItem: (_name) => {
            if (typeof window === 'undefined') return
            // Use the scoped storage key for this store instance
            sessionStorage.removeItem(storageKey)
          },
        },
      }
    )
  )
}

// Get or create a store instance for a specific wallet
function getOrCreateStore(storageKey: string) {
  if (!storeCache.has(storageKey)) {
    storeCache.set(storageKey, createDismissedAlertsStore(storageKey))
  }
  return storeCache.get(storageKey)!
}

// Hook to use the dismissed alerts store for a specific wallet
export function useDismissedUrgencyAlerts(
  walletAddress?: AddressType
): DismissedUrgencyAlertsState {
  const storageKey = getDismissedAlertsStorageKey(walletAddress)

  // Get the cached store instance for this wallet
  const store = getOrCreateStore(storageKey)

  // Use the store
  return useStore(store)
}

// Export for testing: get store instance for a specific wallet address
export function getDismissedAlertsStoreForWallet(walletAddress?: AddressType) {
  const storageKey = getDismissedAlertsStorageKey(walletAddress)
  return getOrCreateStore(storageKey)
}

// Export for testing: reset all cached stores
export function resetDismissedAlertsStores() {
  storeCache.clear()
  if (typeof window !== 'undefined') {
    // Clear all sessionStorage keys matching our pattern
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith('nouns-builder-dismissed-urgency-alerts:')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key))
  }
}

// Backward compatibility export for tests
export const dismissedUrgencyAlertsStore = {
  getState: () => getDismissedAlertsStoreForWallet(undefined).getState(),
  setState: (state: Partial<DismissedUrgencyAlertsState>) =>
    getDismissedAlertsStoreForWallet(undefined).setState(state),
}

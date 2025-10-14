// Compatibility wrapper - maintains backward compatibility with the old API
import { useContext } from 'react'
import { useStore } from 'zustand'

import { ChainStoreProps } from '../createChainStore'
import { ChainStoreContext } from '../providers/ChainStoreProvider'

// Extended store props that include hydration status
export type ChainStoreWithHydration = ChainStoreProps & {
  hasHydrated: boolean
}

// Support both old (no selector) and new (with selector) API patterns
export function useChainStore(): ChainStoreWithHydration
export function useChainStore<T>(selector: (s: ChainStoreWithHydration) => T): T
export function useChainStore<T>(
  selector?: (s: ChainStoreWithHydration) => T
): T | ChainStoreWithHydration {
  const context = useContext(ChainStoreContext)
  if (!context) {
    throw new Error('useChainStore must be used within ChainStoreProvider')
  }

  const { store, hasHydrated } = context

  // Always call useStore with the same pattern to avoid hook violations
  const storeState = useStore(store, (state) => state)

  // Combine store state with hydration status
  const fullState: ChainStoreWithHydration = {
    ...storeState,
    hasHydrated,
  }

  if (selector) {
    return selector(fullState)
  }

  // Return full state for old API compatibility
  return fullState
}

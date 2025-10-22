// Compatibility wrapper - maintains backward compatibility with the old API
import { useContext } from 'react'
import { useStore } from 'zustand'

import { DaoStoreProps } from '../createDaoStore'
import { DaoStoreContext } from '../providers/DaoStoreProvider'

// Support both old (no selector) and new (with selector) API patterns
export function useDaoStore(): DaoStoreProps
export function useDaoStore<T>(selector: (s: DaoStoreProps) => T): T
export function useDaoStore<T>(selector?: (s: DaoStoreProps) => T): T | DaoStoreProps {
  const store = useContext(DaoStoreContext)
  if (!store) {
    throw new Error('useDaoStore must be used within DaoStoreProvider')
  }

  // Always call useStore with the same pattern to avoid hook violations
  const fullState = useStore(store, (state) => state)

  if (selector) {
    return selector(fullState)
  }

  // Return full state for old API compatibility
  return fullState
}

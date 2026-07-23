import { useContext } from 'react'
import { useStore } from 'zustand'

import { type AuthStoreProps, getAuthStore } from '../createAuthStore'
import { AuthStoreContext } from '../providers/AuthStoreProvider'

// Overloads for type safety with selectors
export function useAuthStore(): AuthStoreProps
export function useAuthStore<T>(selector: (s: AuthStoreProps) => T): T
export function useAuthStore<T>(selector?: (s: AuthStoreProps) => T): T | AuthStoreProps {
  const context = useContext(AuthStoreContext)

  const { store } = context ?? {
    store: getAuthStore(),
  }

  const storeState = useStore(store, (state) => state)

  if (selector) {
    return selector(storeState)
  }

  return storeState
}

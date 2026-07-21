import { useContext } from 'react'
import { useStore } from 'zustand'

import { type CandidateStoreProps, getCandidateStore } from '../createCandidateStore'
import { CandidateStoreContext } from '../providers/CandidateStoreProvider'

export type CandidateStoreWithHydration = CandidateStoreProps & {
  hasHydrated: boolean
}

export function useCandidateStore(): CandidateStoreWithHydration
export function useCandidateStore<T>(selector: (s: CandidateStoreWithHydration) => T): T
export function useCandidateStore<T>(
  selector?: (s: CandidateStoreWithHydration) => T
): T | CandidateStoreWithHydration {
  const context = useContext(CandidateStoreContext)

  const { store, hasHydrated } = context ?? {
    store: getCandidateStore(),
    hasHydrated: true,
  }

  const storeState = useStore(store, (state) => state)
  const fullState: CandidateStoreWithHydration = {
    ...storeState,
    hasHydrated,
  }

  if (selector) {
    return selector(fullState)
  }

  return fullState
}

import { useContext } from 'react'
import { useStore } from 'zustand'

import { getProposalStore, type ProposalStoreProps } from '../createProposalStore'
import { ProposalStoreContext } from '../providers/ProposalStoreProvider'

export type ProposalStoreWithHydration = ProposalStoreProps & {
  hasHydrated: boolean
}

export function useProposalStore(): ProposalStoreWithHydration
export function useProposalStore<T>(selector: (s: ProposalStoreWithHydration) => T): T
export function useProposalStore<T>(
  selector?: (s: ProposalStoreWithHydration) => T
): T | ProposalStoreWithHydration {
  const context = useContext(ProposalStoreContext)

  const { store, hasHydrated } = context ?? {
    store: getProposalStore(),
    hasHydrated: true,
  }

  const storeState = useStore(store, (state) => state)
  const fullState: ProposalStoreWithHydration = {
    ...storeState,
    hasHydrated,
  }

  if (selector) {
    return selector(fullState)
  }

  return fullState
}

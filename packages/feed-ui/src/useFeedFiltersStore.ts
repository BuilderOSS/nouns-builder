import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import { useMemo } from 'react'
import type { StoreApi } from 'zustand'
import { createStore, useStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type DaoFilterMode = 'all' | 'specific'

export interface FeedFiltersState {
  chainIds: CHAIN_ID[]
  daoAddresses: string[]
  eventTypes: FeedEventType[]
  daoFilterMode: DaoFilterMode
  setChainIds: (chainIds: CHAIN_ID[]) => void
  setDaoAddresses: (daoAddresses: string[]) => void
  setEventTypes: (eventTypes: FeedEventType[]) => void
  setDaoFilterMode: (mode: DaoFilterMode) => void
  resetFilters: () => void
}

const initialState = {
  chainIds: [],
  daoAddresses: [],
  eventTypes: [],
  daoFilterMode: 'all' as DaoFilterMode,
}

// Cache stores by address to prevent recreation
const storeCache = new Map<string, StoreApi<FeedFiltersState>>()

// Get the network type from environment
const NETWORK_TYPE = process.env.NEXT_PUBLIC_NETWORK_TYPE || 'testnet'

function createFeedFiltersStore(address: string): StoreApi<FeedFiltersState> {
  return createStore<FeedFiltersState>()(
    persist(
      (set) => ({
        ...initialState,
        setChainIds: (chainIds) => set({ chainIds }),
        setDaoAddresses: (daoAddresses) => set({ daoAddresses }),
        setEventTypes: (eventTypes) => set({ eventTypes }),
        setDaoFilterMode: (mode) => set({ daoFilterMode: mode }),
        resetFilters: () =>
          set({
            chainIds: [],
            daoAddresses: [],
            eventTypes: [],
            daoFilterMode: 'all',
          }),
      }),
      {
        name: `nouns-builder-feed-filters-${NETWORK_TYPE}-${address}`,
        storage: createJSONStorage(() => localStorage),
        version: 0,
      }
    )
  )
}

/**
 * Hook for accessing feed filters store with address-based persistence
 * Each wallet address gets its own localStorage key for filter preferences
 * @param address - Wallet address (optional, defaults to 'disconnected')
 */
export function useFeedFiltersStore(address?: string): FeedFiltersState {
  const normalizedAddress = address?.toLowerCase() || 'disconnected'

  const store = useMemo(() => {
    if (!storeCache.has(normalizedAddress)) {
      storeCache.set(normalizedAddress, createFeedFiltersStore(normalizedAddress))
    }
    return storeCache.get(normalizedAddress)!
  }, [normalizedAddress])

  return useStore(store)
}

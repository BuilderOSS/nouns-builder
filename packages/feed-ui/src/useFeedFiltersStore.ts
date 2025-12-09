import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { useMemo } from 'react'
import type { StoreApi } from 'zustand'
import { createStore, useStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type DaoFilterMode = 'all' | 'specific'

export interface SelectedDao {
  address: AddressType
  name: string
  image: string
  chainId: CHAIN_ID
}

export interface FeedFiltersState {
  chainIds: CHAIN_ID[]
  daoAddresses: AddressType[]
  selectedDaos: SelectedDao[]
  eventTypes: FeedEventType[]
  daoFilterMode: DaoFilterMode
  setChainIds: (chainIds: CHAIN_ID[]) => void
  setDaoAddresses: (daoAddresses: AddressType[]) => void
  setSelectedDaos: (selectedDaos: SelectedDao[]) => void
  setEventTypes: (eventTypes: FeedEventType[]) => void
  setDaoFilterMode: (mode: DaoFilterMode) => void
  resetFilters: () => void
  hasActiveFilters: () => boolean
}

const initialState = {
  chainIds: [],
  daoAddresses: [],
  selectedDaos: [],
  eventTypes: [],
  daoFilterMode: 'all' as DaoFilterMode,
}

type CacheAddress = AddressType | 'disconnected'

// Cache stores by address to prevent recreation
const storeCache = new Map<CacheAddress, StoreApi<FeedFiltersState>>()

// Get the network type from environment
const NETWORK_TYPE = process.env.NEXT_PUBLIC_NETWORK_TYPE || 'testnet'

function createFeedFiltersStore(address: CacheAddress): StoreApi<FeedFiltersState> {
  const storage =
    typeof window !== 'undefined'
      ? createJSONStorage<FeedFiltersState>(() => localStorage)
      : undefined

  return createStore<FeedFiltersState>()(
    persist(
      (set, get) => ({
        ...initialState,
        setChainIds: (chainIds) => set({ chainIds }),
        setDaoAddresses: (daoAddresses) => set({ daoAddresses }),
        setSelectedDaos: (selectedDaos) => set({ selectedDaos }),
        setEventTypes: (eventTypes) => set({ eventTypes }),
        setDaoFilterMode: (mode) => set({ daoFilterMode: mode }),
        resetFilters: () =>
          set({
            chainIds: [],
            daoAddresses: [],
            selectedDaos: [],
            eventTypes: [],
            daoFilterMode: 'all',
          }),
        hasActiveFilters: () => {
          const state = get()
          return (
            state.chainIds.length > 0 ||
            state.eventTypes.length > 0 ||
            (state.daoFilterMode === 'specific' && state.daoAddresses.length > 0)
          )
        },
      }),
      {
        name: `nouns-builder-feed-filters-${NETWORK_TYPE}-${address}`,
        storage,
        version: 1,
      }
    )
  )
}

/**
 * Hook for accessing feed filters store with address-based persistence
 * Each wallet address gets its own localStorage key for filter preferences
 * @param address - Wallet address (optional, defaults to 'disconnected')
 */
export function useFeedFiltersStore(address?: AddressType): FeedFiltersState {
  const normalizedAddress: CacheAddress = address
    ? (address.toLowerCase() as AddressType)
    : 'disconnected'

  const store = useMemo(() => {
    if (!storeCache.has(normalizedAddress)) {
      storeCache.set(normalizedAddress, createFeedFiltersStore(normalizedAddress))
    }
    return storeCache.get(normalizedAddress)!
  }, [normalizedAddress])

  return useStore(store)
}

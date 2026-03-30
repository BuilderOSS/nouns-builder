import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const DAO_LIST_PREFERENCES_STORE_IDENTIFIER = `dao-list-preferences-${process.env.NEXT_PUBLIC_NETWORK_TYPE}`

type DaoAddressPreferences = {
  hiddenDaoKeys: string[]
  orderedDaoKeys: string[]
}

type DaoListPreferencesState = {
  prefsByAddress: Record<string, DaoAddressPreferences>
}

export type PreferenceUpdater = string[] | ((currentKeys: string[]) => string[])

type DaoListPreferencesActions = {
  setDaoHidden: (
    address: string,
    chainId: number,
    collectionAddress: string,
    hidden: boolean
  ) => void
  persistOrderedDaos: (address: string, nextOrderedDaos: PreferenceUpdater) => void
  updateDaoVisibilityAndOrder: (
    address: string,
    chainId: number,
    collectionAddress: string,
    hidden: boolean,
    nextOrderedDaoKeys: string[]
  ) => void
  clearAddress: (address: string) => void
}

export type DaoListPreferencesStore = DaoListPreferencesState & DaoListPreferencesActions

const EMPTY_PREFERENCES: DaoAddressPreferences = {
  hiddenDaoKeys: [],
  orderedDaoKeys: [],
}

const normalizeAddress = (address: string): string => address.toLowerCase()

const dedupeKeys = (keys: string[]): string[] => Array.from(new Set(keys))

const resolvePreferenceUpdater = (
  currentKeys: string[],
  updater: PreferenceUpdater
): string[] => {
  return typeof updater === 'function' ? updater(currentKeys) : updater
}

const getAddressPreferences = (
  prefsByAddress: Record<string, DaoAddressPreferences>,
  address: string
): DaoAddressPreferences => prefsByAddress[address] ?? EMPTY_PREFERENCES

export const getDaoListPreferenceItemKey = (chainId: number, collectionAddress: string) =>
  `${chainId}:${collectionAddress.toLowerCase()}`

const areSameKeys = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((key, index) => key === b[index])

export const useDaoListPreferencesStore = create<DaoListPreferencesStore>()(
  persist(
    (set) => ({
      prefsByAddress: {},
      setDaoHidden: (
        address: string,
        chainId: number,
        collectionAddress: string,
        hidden: boolean
      ) => {
        const normalizedAddress = normalizeAddress(address)
        const daoKey = getDaoListPreferenceItemKey(chainId, collectionAddress)

        set((state: DaoListPreferencesStore) => {
          const currentPreferences = getAddressPreferences(
            state.prefsByAddress,
            normalizedAddress
          )
          const nextHiddenDaoKeys = hidden
            ? dedupeKeys([...currentPreferences.hiddenDaoKeys, daoKey])
            : currentPreferences.hiddenDaoKeys.filter((key) => key !== daoKey)

          if (areSameKeys(nextHiddenDaoKeys, currentPreferences.hiddenDaoKeys)) {
            return state
          }

          return {
            prefsByAddress: {
              ...state.prefsByAddress,
              [normalizedAddress]: {
                ...currentPreferences,
                hiddenDaoKeys: nextHiddenDaoKeys,
              },
            },
          }
        })
      },
      persistOrderedDaos: (address: string, nextOrderedDaos: PreferenceUpdater) => {
        const normalizedAddress = normalizeAddress(address)

        set((state: DaoListPreferencesStore) => {
          const currentPreferences = getAddressPreferences(
            state.prefsByAddress,
            normalizedAddress
          )
          const resolvedOrderedDaos = resolvePreferenceUpdater(
            currentPreferences.orderedDaoKeys,
            nextOrderedDaos
          )
          const nextOrderedDaoKeys = dedupeKeys(resolvedOrderedDaos)

          if (areSameKeys(nextOrderedDaoKeys, currentPreferences.orderedDaoKeys)) {
            return state
          }

          return {
            prefsByAddress: {
              ...state.prefsByAddress,
              [normalizedAddress]: {
                ...currentPreferences,
                orderedDaoKeys: nextOrderedDaoKeys,
              },
            },
          }
        })
      },
      updateDaoVisibilityAndOrder: (
        address: string,
        chainId: number,
        collectionAddress: string,
        hidden: boolean,
        nextOrderedDaoKeys: string[]
      ) => {
        const normalizedAddress = normalizeAddress(address)
        const daoKey = getDaoListPreferenceItemKey(chainId, collectionAddress)

        set((state: DaoListPreferencesStore) => {
          const currentPreferences = getAddressPreferences(
            state.prefsByAddress,
            normalizedAddress
          )
          const nextHiddenDaoKeys = hidden
            ? dedupeKeys([...currentPreferences.hiddenDaoKeys, daoKey])
            : currentPreferences.hiddenDaoKeys.filter((key) => key !== daoKey)
          const dedupedOrderedDaoKeys = dedupeKeys(nextOrderedDaoKeys)

          if (
            areSameKeys(nextHiddenDaoKeys, currentPreferences.hiddenDaoKeys) &&
            areSameKeys(dedupedOrderedDaoKeys, currentPreferences.orderedDaoKeys)
          ) {
            return state
          }

          return {
            prefsByAddress: {
              ...state.prefsByAddress,
              [normalizedAddress]: {
                ...currentPreferences,
                hiddenDaoKeys: nextHiddenDaoKeys,
                orderedDaoKeys: dedupedOrderedDaoKeys,
              },
            },
          }
        })
      },
      clearAddress: (address: string) => {
        const normalizedAddress = normalizeAddress(address)

        set((state: DaoListPreferencesStore) => {
          if (!state.prefsByAddress[normalizedAddress]) {
            return state
          }

          const nextPrefsByAddress = { ...state.prefsByAddress }
          delete nextPrefsByAddress[normalizedAddress]

          return {
            prefsByAddress: nextPrefsByAddress,
          }
        })
      },
    }),
    {
      name: DAO_LIST_PREFERENCES_STORE_IDENTIFIER,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state: DaoListPreferencesStore) => ({
        prefsByAddress: state.prefsByAddress,
      }),
    }
  )
)

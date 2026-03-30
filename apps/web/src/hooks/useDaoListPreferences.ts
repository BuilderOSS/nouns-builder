import React from 'react'
import {
  DaoListPreferencesStore,
  getDaoListPreferenceItemKey,
  PreferenceUpdater,
  useDaoListPreferencesStore,
} from 'src/stores/daoListPreferencesStore'

const EMPTY_KEYS: string[] = []

export { getDaoListPreferenceItemKey }

type DaoSortFn = <T>(
  daos: T[],
  getCollectionAddress: (dao: T) => string,
  getChainId: (dao: T) => number
) => T[]

type GroupHiddenDaosLastFn = <T>(
  daos: T[],
  getCollectionAddress: (dao: T) => string,
  getChainId: (dao: T) => number
) => T[]

export type DaoListPreferences = {
  hiddenDaoKeys: string[]
  hiddenDaoCount: number
  orderedDaoKeys: string[]
  isDaoHidden: (chainId: number, collectionAddress: string) => boolean
  setDaoHidden: (chainId: number, collectionAddress: string, hidden: boolean) => void
  persistOrderedDaos: (nextOrderedDaos: PreferenceUpdater) => void
  sortDaos: DaoSortFn
  groupHiddenDaosLast: GroupHiddenDaosLastFn
}

export const useDaoListPreferences = (address?: string): DaoListPreferences => {
  const normalizedAddress = React.useMemo(() => address?.toLowerCase(), [address])

  const hiddenDaoKeys = useDaoListPreferencesStore(
    React.useCallback(
      (state: DaoListPreferencesStore): string[] => {
        if (!normalizedAddress) return EMPTY_KEYS
        return state.prefsByAddress[normalizedAddress]?.hiddenDaoKeys ?? EMPTY_KEYS
      },
      [normalizedAddress]
    )
  )

  const orderedDaoKeys = useDaoListPreferencesStore(
    React.useCallback(
      (state: DaoListPreferencesStore): string[] => {
        if (!normalizedAddress) return EMPTY_KEYS
        return state.prefsByAddress[normalizedAddress]?.orderedDaoKeys ?? EMPTY_KEYS
      },
      [normalizedAddress]
    )
  )

  const setDaoHiddenForAddress = useDaoListPreferencesStore(
    (state: DaoListPreferencesStore) => state.setDaoHidden
  )
  const persistOrderedDaosForAddress = useDaoListPreferencesStore(
    (state: DaoListPreferencesStore) => state.persistOrderedDaos
  )

  const hiddenDaoKeySet = React.useMemo(() => new Set(hiddenDaoKeys), [hiddenDaoKeys])
  const orderedDaoKeySet = React.useMemo(() => new Set(orderedDaoKeys), [orderedDaoKeys])

  const setDaoHidden = React.useCallback(
    (chainId: number, collectionAddress: string, hidden: boolean) => {
      if (!normalizedAddress) return
      setDaoHiddenForAddress(normalizedAddress, chainId, collectionAddress, hidden)
    },
    [normalizedAddress, setDaoHiddenForAddress]
  )

  const persistOrderedDaos = React.useCallback(
    (nextOrderedDaos: PreferenceUpdater) => {
      if (!normalizedAddress) return
      persistOrderedDaosForAddress(normalizedAddress, nextOrderedDaos)
    },
    [normalizedAddress, persistOrderedDaosForAddress]
  )

  const isDaoHidden = React.useCallback(
    (chainId: number, collectionAddress: string) =>
      hiddenDaoKeySet.has(getDaoListPreferenceItemKey(chainId, collectionAddress)),
    [hiddenDaoKeySet]
  )

  const sortDaos = React.useCallback<DaoSortFn>(
    <T>(
      daos: T[],
      getCollectionAddress: (dao: T) => string,
      getChainId: (dao: T) => number
    ) => {
      const keyedDaos = daos.map((dao) => ({
        dao,
        key: getDaoListPreferenceItemKey(getChainId(dao), getCollectionAddress(dao)),
      }))

      const daoKeySet = new Set(keyedDaos.map((item) => item.key))
      const orderedKeysForDaos = orderedDaoKeys.filter((key: string) =>
        daoKeySet.has(key)
      )
      const keyedDaoMap = new Map(keyedDaos.map((item) => [item.key, item.dao]))

      const orderedDaos = orderedKeysForDaos
        .map((key: string) => keyedDaoMap.get(key))
        .filter((item: T | undefined): item is T => item !== undefined)

      const unorderedDaos = keyedDaos
        .filter((item) => !orderedDaoKeySet.has(item.key))
        .map((item) => item.dao)

      return [...orderedDaos, ...unorderedDaos]
    },
    [orderedDaoKeySet, orderedDaoKeys]
  )

  const groupHiddenDaosLast = React.useCallback<GroupHiddenDaosLastFn>(
    <T>(
      daos: T[],
      getCollectionAddress: (dao: T) => string,
      getChainId: (dao: T) => number
    ) => {
      const visibleDaos: T[] = []
      const hiddenDaos: T[] = []

      daos.forEach((dao) => {
        if (isDaoHidden(getChainId(dao), getCollectionAddress(dao))) {
          hiddenDaos.push(dao)
          return
        }

        visibleDaos.push(dao)
      })

      return [...visibleDaos, ...hiddenDaos]
    },
    [isDaoHidden]
  )

  return {
    hiddenDaoKeys,
    hiddenDaoCount: hiddenDaoKeys.length,
    orderedDaoKeys,
    isDaoHidden,
    setDaoHidden,
    persistOrderedDaos,
    sortDaos,
    groupHiddenDaosLast,
  }
}

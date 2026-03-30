import React from 'react'

const getHiddenStorageKey = (address: string) =>
  `dao-list:hidden:${address.toLowerCase()}`
const getOrderStorageKey = (address: string) => `dao-list:order:${address.toLowerCase()}`
const getLegacyPinnedStorageKey = (address: string) =>
  `dao-shortlist:pinned:${address.toLowerCase()}`

export const getDaoListPreferenceItemKey = (chainId: number, collectionAddress: string) =>
  `${chainId}:${collectionAddress.toLowerCase()}`

const DAO_LIST_PREFERENCES_EVENT = 'dao-list-preferences:update'

type DaoListPreferencesEventDetail = {
  hiddenStorageKey?: string
  orderStorageKey?: string
  hiddenDaoKeys?: string[]
  orderedDaoKeys?: string[]
}

type PreferenceUpdater = string[] | ((currentKeys: string[]) => string[])

const parseStoredKeys = (storedValue: string | null) => {
  if (!storedValue) return []

  try {
    const parsed = JSON.parse(storedValue)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((value): value is string => typeof value === 'string')
  } catch {
    return []
  }
}

export const useDaoListPreferences = (address?: string) => {
  const hiddenStorageKey = React.useMemo(
    () => (address ? getHiddenStorageKey(address) : undefined),
    [address]
  )
  const orderStorageKey = React.useMemo(
    () => (address ? getOrderStorageKey(address) : undefined),
    [address]
  )
  const legacyPinnedStorageKey = React.useMemo(
    () => (address ? getLegacyPinnedStorageKey(address) : undefined),
    [address]
  )

  const [hiddenDaoKeys, setHiddenDaoKeys] = React.useState<string[]>([])
  const [orderedDaoKeys, setOrderedDaoKeys] = React.useState<string[]>([])

  const hiddenDaoKeySet = React.useMemo(() => new Set(hiddenDaoKeys), [hiddenDaoKeys])
  const orderedDaoKeySet = React.useMemo(() => new Set(orderedDaoKeys), [orderedDaoKeys])

  React.useEffect(() => {
    if (!hiddenStorageKey || typeof window === 'undefined') {
      setHiddenDaoKeys([])
      return
    }

    setHiddenDaoKeys(parseStoredKeys(window.localStorage.getItem(hiddenStorageKey)))
  }, [hiddenStorageKey])

  React.useEffect(() => {
    if (!orderStorageKey || typeof window === 'undefined') {
      setOrderedDaoKeys([])
      return
    }

    setOrderedDaoKeys(parseStoredKeys(window.localStorage.getItem(orderStorageKey)))
  }, [orderStorageKey])

  React.useEffect(() => {
    if (!legacyPinnedStorageKey || typeof window === 'undefined') return

    try {
      window.localStorage.removeItem(legacyPinnedStorageKey)
    } catch (e) {
      console.error('Failed to clear legacy pinned DAO state', e)
    }
  }, [legacyPinnedStorageKey])

  React.useEffect(() => {
    if ((!hiddenStorageKey && !orderStorageKey) || typeof window === 'undefined') return

    const onPreferencesUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<DaoListPreferencesEventDetail>

      if (
        customEvent.detail?.hiddenStorageKey === hiddenStorageKey &&
        customEvent.detail.hiddenDaoKeys
      ) {
        setHiddenDaoKeys(customEvent.detail.hiddenDaoKeys)
      }

      if (
        customEvent.detail?.orderStorageKey === orderStorageKey &&
        customEvent.detail.orderedDaoKeys
      ) {
        setOrderedDaoKeys(customEvent.detail.orderedDaoKeys)
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === hiddenStorageKey) {
        setHiddenDaoKeys(parseStoredKeys(event.newValue))
      }

      if (event.key === orderStorageKey) {
        setOrderedDaoKeys(parseStoredKeys(event.newValue))
      }
    }

    window.addEventListener(DAO_LIST_PREFERENCES_EVENT, onPreferencesUpdate)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(DAO_LIST_PREFERENCES_EVENT, onPreferencesUpdate)
      window.removeEventListener('storage', onStorage)
    }
  }, [hiddenStorageKey, orderStorageKey])

  const persistHiddenDaosToStorage = React.useCallback(
    (nextHiddenDaos: string[]) => {
      if (!hiddenStorageKey || typeof window === 'undefined') return

      try {
        window.localStorage.setItem(hiddenStorageKey, JSON.stringify(nextHiddenDaos))
        window.dispatchEvent(
          new CustomEvent(DAO_LIST_PREFERENCES_EVENT, {
            detail: {
              hiddenStorageKey,
              hiddenDaoKeys: nextHiddenDaos,
            },
          })
        )
      } catch (e) {
        console.error('Failed to persist hidden DAO state', e)
      }
    },
    [hiddenStorageKey]
  )

  const persistOrderedDaosToStorage = React.useCallback(
    (nextOrderedDaos: string[]) => {
      if (!orderStorageKey || typeof window === 'undefined') return

      try {
        window.localStorage.setItem(orderStorageKey, JSON.stringify(nextOrderedDaos))
        window.dispatchEvent(
          new CustomEvent(DAO_LIST_PREFERENCES_EVENT, {
            detail: {
              orderStorageKey,
              orderedDaoKeys: nextOrderedDaos,
            },
          })
        )
      } catch (e) {
        console.error('Failed to persist DAO order state', e)
      }
    },
    [orderStorageKey]
  )

  const persistHiddenDaos = React.useCallback(
    (nextHiddenDaos: PreferenceUpdater) => {
      setHiddenDaoKeys((currentHiddenDaos) => {
        const resolvedHiddenDaos =
          typeof nextHiddenDaos === 'function'
            ? nextHiddenDaos(currentHiddenDaos)
            : nextHiddenDaos
        const dedupedHiddenDaos = Array.from(new Set(resolvedHiddenDaos))
        persistHiddenDaosToStorage(dedupedHiddenDaos)
        return dedupedHiddenDaos
      })
    },
    [persistHiddenDaosToStorage]
  )

  const persistOrderedDaos = React.useCallback(
    (nextOrderedDaos: PreferenceUpdater) => {
      setOrderedDaoKeys((currentOrderedDaos) => {
        const resolvedOrderedDaos =
          typeof nextOrderedDaos === 'function'
            ? nextOrderedDaos(currentOrderedDaos)
            : nextOrderedDaos
        const dedupedOrderedDaos = Array.from(new Set(resolvedOrderedDaos))
        persistOrderedDaosToStorage(dedupedOrderedDaos)
        return dedupedOrderedDaos
      })
    },
    [persistOrderedDaosToStorage]
  )

  const isDaoHidden = React.useCallback(
    (chainId: number, collectionAddress: string) =>
      hiddenDaoKeySet.has(getDaoListPreferenceItemKey(chainId, collectionAddress)),
    [hiddenDaoKeySet]
  )

  const setDaoHidden = React.useCallback(
    (chainId: number, collectionAddress: string, hidden: boolean) => {
      const daoKey = getDaoListPreferenceItemKey(chainId, collectionAddress)

      if (hidden) {
        persistHiddenDaos((currentHiddenDaos) => {
          if (currentHiddenDaos.includes(daoKey)) {
            return currentHiddenDaos
          }

          return [...currentHiddenDaos, daoKey]
        })
        return
      }

      persistHiddenDaos((currentHiddenDaos) =>
        currentHiddenDaos.filter((key) => key !== daoKey)
      )
    },
    [persistHiddenDaos]
  )

  const sortDaos = React.useCallback(
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
      const orderedKeysForDaos = orderedDaoKeys.filter((key) => daoKeySet.has(key))
      const keyedDaoMap = new Map(keyedDaos.map((item) => [item.key, item.dao]))

      const orderedDaos = orderedKeysForDaos
        .map((key) => keyedDaoMap.get(key))
        .filter((item): item is T => item !== undefined)

      const unorderedDaos = keyedDaos
        .filter((item) => !orderedDaoKeySet.has(item.key))
        .map((item) => item.dao)

      return [...orderedDaos, ...unorderedDaos]
    },
    [orderedDaoKeySet, orderedDaoKeys]
  )

  const groupHiddenDaosLast = React.useCallback(
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

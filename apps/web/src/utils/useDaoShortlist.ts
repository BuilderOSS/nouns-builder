import React from 'react'

const getDaoShortlistStorageKey = (address: string) =>
  `dao-shortlist:hidden:${address.toLowerCase()}`
const getDaoPinnedStorageKey = (address: string) =>
  `dao-shortlist:pinned:${address.toLowerCase()}`

const getDaoShortlistItemKey = (chainId: number, collectionAddress: string) =>
  `${chainId}:${collectionAddress.toLowerCase()}`

const SHORTLIST_EVENT = 'dao-shortlist:update'

export const useDaoShortlist = (address?: string) => {
  const hiddenStorageKey = React.useMemo(
    () => (address ? getDaoShortlistStorageKey(address) : undefined),
    [address]
  )
  const pinnedStorageKey = React.useMemo(
    () => (address ? getDaoPinnedStorageKey(address) : undefined),
    [address]
  )
  const [hiddenDaoKeys, setHiddenDaoKeys] = React.useState<string[]>([])
  const [pinnedDaoKeys, setPinnedDaoKeys] = React.useState<string[]>([])

  React.useEffect(() => {
    if (!hiddenStorageKey || typeof window === 'undefined') {
      setHiddenDaoKeys([])
      return
    }

    try {
      const stored = window.localStorage.getItem(hiddenStorageKey)
      if (!stored) {
        setHiddenDaoKeys([])
        return
      }
      const parsed = JSON.parse(stored)
      setHiddenDaoKeys(Array.isArray(parsed) ? parsed : [])
    } catch (e) {
      console.error('Failed to parse hidden DAO shortlist state', e)
      setHiddenDaoKeys([])
    }
  }, [hiddenStorageKey])

  React.useEffect(() => {
    if (!pinnedStorageKey || typeof window === 'undefined') {
      setPinnedDaoKeys([])
      return
    }

    try {
      const stored = window.localStorage.getItem(pinnedStorageKey)
      if (!stored) {
        setPinnedDaoKeys([])
        return
      }
      const parsed = JSON.parse(stored)
      setPinnedDaoKeys(Array.isArray(parsed) ? parsed.slice(0, 3) : [])
    } catch (e) {
      console.error('Failed to parse pinned DAO shortlist state', e)
      setPinnedDaoKeys([])
    }
  }, [pinnedStorageKey])

  React.useEffect(() => {
    if ((!hiddenStorageKey && !pinnedStorageKey) || typeof window === 'undefined') return

    const onShortlistUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        hiddenStorageKey: string
        pinnedStorageKey: string
        hiddenDaoKeys: string[]
        pinnedDaoKeys: string[]
      }>
      if (customEvent.detail?.hiddenStorageKey === hiddenStorageKey) {
        setHiddenDaoKeys(customEvent.detail.hiddenDaoKeys)
      }
      if (customEvent.detail?.pinnedStorageKey === pinnedStorageKey) {
        setPinnedDaoKeys(customEvent.detail.pinnedDaoKeys.slice(0, 3))
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === hiddenStorageKey) {
        try {
          const parsed = event.newValue ? JSON.parse(event.newValue) : []
          setHiddenDaoKeys(Array.isArray(parsed) ? parsed : [])
        } catch {
          setHiddenDaoKeys([])
        }
      }
      if (event.key === pinnedStorageKey) {
        try {
          const parsed = event.newValue ? JSON.parse(event.newValue) : []
          setPinnedDaoKeys(Array.isArray(parsed) ? parsed.slice(0, 3) : [])
        } catch {
          setPinnedDaoKeys([])
        }
      }
    }

    window.addEventListener(SHORTLIST_EVENT, onShortlistUpdate)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(SHORTLIST_EVENT, onShortlistUpdate)
      window.removeEventListener('storage', onStorage)
    }
  }, [hiddenStorageKey, pinnedStorageKey])

  const persistHiddenDaos = React.useCallback(
    (nextHiddenDaos: string[]) => {
      setHiddenDaoKeys(nextHiddenDaos)
      if (!hiddenStorageKey || typeof window === 'undefined') return

      try {
        window.localStorage.setItem(hiddenStorageKey, JSON.stringify(nextHiddenDaos))
        window.dispatchEvent(
          new CustomEvent(SHORTLIST_EVENT, {
            detail: {
              hiddenStorageKey,
              pinnedStorageKey,
              hiddenDaoKeys: nextHiddenDaos,
              pinnedDaoKeys,
            },
          })
        )
      } catch (e) {
        console.error('Failed to persist hidden DAO shortlist state', e)
      }
    },
    [hiddenStorageKey, pinnedStorageKey, pinnedDaoKeys]
  )

  const persistPinnedDaos = React.useCallback(
    (nextPinnedDaos: string[]) => {
      const limitedPinnedDaos = nextPinnedDaos.slice(0, 3)
      setPinnedDaoKeys(limitedPinnedDaos)
      if (!pinnedStorageKey || typeof window === 'undefined') return

      try {
        window.localStorage.setItem(pinnedStorageKey, JSON.stringify(limitedPinnedDaos))
        window.dispatchEvent(
          new CustomEvent(SHORTLIST_EVENT, {
            detail: {
              hiddenStorageKey,
              pinnedStorageKey,
              hiddenDaoKeys,
              pinnedDaoKeys: limitedPinnedDaos,
            },
          })
        )
      } catch (e) {
        console.error('Failed to persist pinned DAO shortlist state', e)
      }
    },
    [hiddenStorageKey, hiddenDaoKeys, pinnedStorageKey]
  )

  const isDaoHidden = React.useCallback(
    (chainId: number, collectionAddress: string) =>
      hiddenDaoKeys.includes(getDaoShortlistItemKey(chainId, collectionAddress)),
    [hiddenDaoKeys]
  )

  const hideDao = React.useCallback(
    (chainId: number, collectionAddress: string) => {
      const shortlistKey = getDaoShortlistItemKey(chainId, collectionAddress)
      if (hiddenDaoKeys.includes(shortlistKey)) return
      persistHiddenDaos([...hiddenDaoKeys, shortlistKey])
    },
    [hiddenDaoKeys, persistHiddenDaos]
  )

  const unhideDao = React.useCallback(
    (chainId: number, collectionAddress: string) => {
      const shortlistKey = getDaoShortlistItemKey(chainId, collectionAddress)
      persistHiddenDaos(hiddenDaoKeys.filter((x) => x !== shortlistKey))
    },
    [hiddenDaoKeys, persistHiddenDaos]
  )

  const isDaoPinned = React.useCallback(
    (chainId: number, collectionAddress: string) =>
      pinnedDaoKeys.includes(getDaoShortlistItemKey(chainId, collectionAddress)),
    [pinnedDaoKeys]
  )

  const pinDao = React.useCallback(
    (chainId: number, collectionAddress: string) => {
      const shortlistKey = getDaoShortlistItemKey(chainId, collectionAddress)
      if (pinnedDaoKeys.includes(shortlistKey)) return
      if (pinnedDaoKeys.length >= 3) return
      persistPinnedDaos([...pinnedDaoKeys, shortlistKey])
    },
    [pinnedDaoKeys, persistPinnedDaos]
  )

  const unpinDao = React.useCallback(
    (chainId: number, collectionAddress: string) => {
      const shortlistKey = getDaoShortlistItemKey(chainId, collectionAddress)
      persistPinnedDaos(pinnedDaoKeys.filter((x) => x !== shortlistKey))
    },
    [pinnedDaoKeys, persistPinnedDaos]
  )

  return {
    hiddenDaoKeys,
    hiddenDaoCount: hiddenDaoKeys.length,
    pinnedDaoKeys,
    pinnedDaoCount: pinnedDaoKeys.length,
    isDaoHidden,
    isDaoPinned,
    hideDao,
    unhideDao,
    pinDao,
    unpinDao,
    pinLimitReached: pinnedDaoKeys.length >= 3,
  }
}

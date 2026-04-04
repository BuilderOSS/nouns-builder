import {
  type DaoSearchResult,
  type ExploreDaoWithChainId,
} from '@buildeross/sdk/subgraph'
import React from 'react'

export const FAVORITE_DAO_LIMIT = 10

const FAVORITE_DAOS_EVENT = 'favorite-daos:update'

const getFavoriteDaosStorageKey = (address: string) =>
  `favorite-daos:${address.toLowerCase()}`

const getFavoriteItemKey = (chainId: number, collectionAddress: string) =>
  `${chainId}:${collectionAddress.toLowerCase()}`

export type FavoriteDao = {
  chainId: number
  collectionAddress: string
  tokenId?: number | string
  tokenName?: string
  tokenImage?: string
  collectionName?: string
  bid?: string
  endTime?: number
}

type FavoriteDaosEventDetail = {
  favorites?: FavoriteDao[]
  storageKey?: string
}

const isFavoriteDao = (value: unknown): value is FavoriteDao => {
  if (!value || typeof value !== 'object') return false

  const item = value as FavoriteDao
  return typeof item.chainId === 'number' && typeof item.collectionAddress === 'string'
}

const parseStoredFavorites = (storedValue: string | null) => {
  if (!storedValue) return []

  try {
    const parsed = JSON.parse(storedValue)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isFavoriteDao)
  } catch {
    return []
  }
}

const dedupeFavorites = (favorites: FavoriteDao[]) => {
  const seenKeys = new Set<string>()

  return favorites.filter((favorite) => {
    const key = getFavoriteItemKey(favorite.chainId, favorite.collectionAddress)
    if (seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })
}

export const buildFavoriteDao = (
  dao: ExploreDaoWithChainId | DaoSearchResult
): FavoriteDao => {
  const bid = dao.highestBid?.amount ?? undefined

  return {
    chainId: dao.chainId,
    collectionAddress: dao.dao.tokenAddress,
    tokenId:
      typeof dao.token?.tokenId === 'bigint'
        ? dao.token.tokenId.toString()
        : (dao.token?.tokenId ?? undefined),
    tokenImage: dao.token?.image ?? undefined,
    tokenName: dao.token?.name ?? undefined,
    collectionName: dao.dao.name ?? undefined,
    bid: bid ? bid.toString() : undefined,
    endTime: dao.endTime ?? undefined,
  }
}

export const getFavoriteDaoKey = (
  favorite: Pick<FavoriteDao, 'chainId' | 'collectionAddress'>
) => getFavoriteItemKey(favorite.chainId, favorite.collectionAddress)

export const useFavoriteDaos = (address?: string) => {
  const storageKey = React.useMemo(
    () => (address ? getFavoriteDaosStorageKey(address) : undefined),
    [address]
  )
  const [favorites, setFavorites] = React.useState<FavoriteDao[]>([])

  React.useEffect(() => {
    if (!storageKey || typeof window === 'undefined') {
      setFavorites([])
      return
    }

    setFavorites(parseStoredFavorites(window.localStorage.getItem(storageKey)))
  }, [storageKey])

  React.useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return

    const onFavoritesUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<FavoriteDaosEventDetail>

      if (customEvent.detail?.storageKey === storageKey && customEvent.detail.favorites) {
        setFavorites(customEvent.detail.favorites)
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        setFavorites(parseStoredFavorites(event.newValue))
      }
    }

    window.addEventListener(FAVORITE_DAOS_EVENT, onFavoritesUpdate)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(FAVORITE_DAOS_EVENT, onFavoritesUpdate)
      window.removeEventListener('storage', onStorage)
    }
  }, [storageKey])

  const persistFavorites = React.useCallback(
    (nextFavorites: FavoriteDao[]) => {
      if (!storageKey || typeof window === 'undefined') return

      const dedupedFavorites = dedupeFavorites(nextFavorites).slice(0, FAVORITE_DAO_LIMIT)

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(dedupedFavorites))
        window.dispatchEvent(
          new CustomEvent(FAVORITE_DAOS_EVENT, {
            detail: {
              storageKey,
              favorites: dedupedFavorites,
            },
          })
        )
      } catch (e) {
        console.error('Failed to persist favorite DAO state', e)
      }
    },
    [storageKey]
  )

  const favoriteKeys = React.useMemo(
    () => new Set(favorites.map((favorite) => getFavoriteDaoKey(favorite))),
    [favorites]
  )

  const isDaoFavorited = React.useCallback(
    (chainId: number, collectionAddress: string) =>
      favoriteKeys.has(getFavoriteItemKey(chainId, collectionAddress)),
    [favoriteKeys]
  )

  const toggleFavorite = React.useCallback(
    (favorite: FavoriteDao) => {
      const favoriteKey = getFavoriteDaoKey(favorite)
      const isFavorited = favoriteKeys.has(favoriteKey)

      if (isFavorited) {
        const nextFavorites = favorites.filter(
          (item) => getFavoriteDaoKey(item) !== favoriteKey
        )
        setFavorites(nextFavorites)
        persistFavorites(nextFavorites)
        return { didToggle: true, isFavorited: false as const }
      }

      if (favorites.length >= FAVORITE_DAO_LIMIT) {
        return {
          didToggle: false,
          isFavorited: false as const,
          reason: 'limit' as const,
        }
      }

      const nextFavorites = [favorite, ...favorites]
      setFavorites(nextFavorites)
      persistFavorites(nextFavorites)
      return { didToggle: true, isFavorited: true as const }
    },
    [favoriteKeys, favorites, persistFavorites]
  )

  return {
    favorites,
    favoriteCount: favorites.length,
    hasReachedFavoriteLimit: favorites.length >= FAVORITE_DAO_LIMIT,
    isDaoFavorited,
    toggleFavorite,
  }
}

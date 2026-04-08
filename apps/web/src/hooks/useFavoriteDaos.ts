import React from 'react'
import {
  FAVORITE_DAO_LIMIT,
  FavoriteDao,
  FavoriteDaosStore,
  buildFavoriteDao,
  getFavoriteDaoKey,
  useFavoriteDaosStore,
} from 'src/stores/favoriteDaosStore'

const EMPTY_FAVORITES: FavoriteDao[] = []

export { FAVORITE_DAO_LIMIT, buildFavoriteDao, getFavoriteDaoKey, type FavoriteDao }

export const useFavoriteDaos = (address?: string) => {
  const normalizedAddress = React.useMemo(() => address?.toLowerCase(), [address])

  const favorites = useFavoriteDaosStore(
    React.useCallback(
      (state: FavoriteDaosStore): FavoriteDao[] => {
        if (!normalizedAddress) return EMPTY_FAVORITES

        return state.favoritesByAddress[normalizedAddress] ?? EMPTY_FAVORITES
      },
      [normalizedAddress]
    )
  )

  const hydrateLegacyFavorites = useFavoriteDaosStore(
    (state: FavoriteDaosStore) => state.hydrateLegacyFavorites
  )
  const toggleFavoriteForAddress = useFavoriteDaosStore(
    (state: FavoriteDaosStore) => state.toggleFavorite
  )

  React.useEffect(() => {
    if (!normalizedAddress) return

    hydrateLegacyFavorites(normalizedAddress)
  }, [hydrateLegacyFavorites, normalizedAddress])

  const favoriteKeys = React.useMemo(
    () => new Set(favorites.map((favorite) => getFavoriteDaoKey(favorite))),
    [favorites]
  )

  const isDaoFavorited = React.useCallback(
    (chainId: number, collectionAddress: string) =>
      favoriteKeys.has(`${chainId}:${collectionAddress.toLowerCase()}`),
    [favoriteKeys]
  )

  const toggleFavorite = React.useCallback(
    (favorite: FavoriteDao) => {
      if (!normalizedAddress) {
        return {
          didToggle: false as const,
          isFavorited: false as const,
          reason: 'limit' as const,
        }
      }

      return toggleFavoriteForAddress(normalizedAddress, favorite)
    },
    [normalizedAddress, toggleFavoriteForAddress]
  )

  return {
    favorites,
    favoriteCount: favorites.length,
    hasReachedFavoriteLimit: favorites.length >= FAVORITE_DAO_LIMIT,
    isDaoFavorited,
    toggleFavorite,
  }
}

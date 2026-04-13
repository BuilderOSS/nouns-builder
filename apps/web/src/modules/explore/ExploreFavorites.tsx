import { Box, Grid, Text } from '@buildeross/zord'
import React from 'react'
import { FAVORITE_DAO_LIMIT, useFavoriteDaos } from 'src/hooks/useFavoriteDaos'
import { type FavoriteDao, getFavoriteDaoKey } from 'src/stores/favoriteDaosStore'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import { exploreGrid } from './Explore.css'
import { ExploreDaoCard } from './ExploreDaoCard'
import { ExploreToolbar } from './ExploreToolbar'

export const ExploreFavorites = () => {
  const { address } = useAccount()
  const { favoriteCount, favorites, isDaoFavorited, toggleFavorite } =
    useFavoriteDaos(address)

  const favoritesParam = React.useMemo(
    () => favorites.map((favorite) => getFavoriteDaoKey(favorite)).join(','),
    [favorites]
  )

  const {
    data: liveFavoriteDaos,
    isLoading,
    error: loadError,
  } = useSWR<{ daos: FavoriteDao[] }>(
    favoritesParam
      ? `/api/favorite-daos?favorites=${encodeURIComponent(favoritesParam)}`
      : null,
    async (url: string) => {
      const response = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error('Failed to fetch favorite daos')
      return response.json()
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  )

  const mergedFavorites = React.useMemo(() => {
    if (!liveFavoriteDaos?.daos?.length) return favorites

    const liveFavoritesByKey = new Map(
      liveFavoriteDaos.daos.map((favorite) => [getFavoriteDaoKey(favorite), favorite])
    )

    return favorites.map((favorite) => {
      const liveFavorite = liveFavoritesByKey.get(getFavoriteDaoKey(favorite))
      return liveFavorite ? { ...favorite, ...liveFavorite } : favorite
    })
  }, [favorites, liveFavoriteDaos])

  return (
    <>
      <ExploreToolbar title="Favorite DAOs" />

      {!address ? (
        <Text
          style={{ maxWidth: 912, minHeight: 250, padding: '150px 0px' }}
          variant="paragraph-md"
          color="tertiary"
        >
          Connect your wallet to view your favorite DAOs.
        </Text>
      ) : mergedFavorites.length || isLoading ? (
        <Box style={{ width: '100%', maxWidth: 912 }}>
          {mergedFavorites.length > 0 && (
            <Grid className={exploreGrid}>
              {mergedFavorites.map((favorite) => (
                <ExploreDaoCard
                  key={`${favorite.chainId}:${favorite.collectionAddress.toLowerCase()}`}
                  dao={favorite}
                  isFavorited={isDaoFavorited(
                    favorite.chainId,
                    favorite.collectionAddress
                  )}
                  onFavoriteToggle={toggleFavorite}
                />
              ))}
            </Grid>
          )}
          {loadError && (
            <Text variant="paragraph-sm" color="negative" align="left" mt="x4">
              Failed to load latest data. Showing cached favorites.
            </Text>
          )}
          <Text variant="paragraph-sm" color="tertiary" align="left" mt="x4" mb="x16">
            {favoriteCount}/{FAVORITE_DAO_LIMIT} favorites used
          </Text>
        </Box>
      ) : (
        <Text
          style={{ maxWidth: 912, minHeight: 250, padding: '150px 0px' }}
          variant="paragraph-md"
          color="tertiary"
        >
          You have not favorited any DAOs yet.
        </Text>
      )}
    </>
  )
}

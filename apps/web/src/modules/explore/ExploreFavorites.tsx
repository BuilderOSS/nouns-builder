import { Box, Grid, Text } from '@buildeross/zord'
import React from 'react'
import { FAVORITE_DAO_LIMIT, useFavoriteDaos } from 'src/hooks/useFavoriteDaos'
import { useAccount } from 'wagmi'

import { exploreGrid } from './Explore.css'
import { ExploreDaoCard } from './ExploreDaoCard'
import { ExploreToolbar } from './ExploreToolbar'

export const ExploreFavorites = () => {
  const { address } = useAccount()
  const { favoriteCount, favorites, isDaoFavorited, toggleFavorite } =
    useFavoriteDaos(address)

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
      ) : favorites.length ? (
        <Box style={{ width: '100%', maxWidth: 912 }}>
          <Grid className={exploreGrid}>
            {favorites.map((favorite) => (
              <ExploreDaoCard
                key={`${favorite.chainId}:${favorite.collectionAddress.toLowerCase()}`}
                dao={favorite}
                isFavorited={isDaoFavorited(favorite.chainId, favorite.collectionAddress)}
                onFavoriteToggle={toggleFavorite}
              />
            ))}
          </Grid>
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

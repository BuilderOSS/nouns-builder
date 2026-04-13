import { useExploreUserDaos as useMyDaos } from '@buildeross/hooks/useExploreUserDaos'
import { Grid } from '@buildeross/zord'
import React from 'react'
import { FAVORITE_DAO_LIMIT, useFavoriteDaos } from 'src/hooks/useFavoriteDaos'
import { useAccount } from 'wagmi'

import { exploreGrid } from './Explore.css'
import { ExploreDaoCard } from './ExploreDaoCard'
import { ExploreNoDaos } from './ExploreNoDaos'
import { ExploreSkeleton } from './ExploreSkeleton'
import { ExploreToolbar } from './ExploreToolbar'

export const ExploreMyDaos = () => {
  const { address } = useAccount()
  const isWalletConnected = Boolean(address)
  const { hasReachedFavoriteLimit, isDaoFavorited, toggleFavorite } =
    useFavoriteDaos(address)

  const { daos, isLoading } = useMyDaos({ address })

  return (
    <>
      <ExploreToolbar title={`My DAOs`} />
      {isLoading ? (
        <ExploreSkeleton />
      ) : daos?.length ? (
        <Grid className={exploreGrid} mb={'x16'}>
          {daos.map((dao) => {
            if (!dao.chainId) return null

            return (
              <ExploreDaoCard
                key={`${dao.chainId}:${dao.dao.tokenAddress.toLowerCase()}`}
                dao={dao}
                isFavorited={isDaoFavorited(dao.chainId, dao.dao.tokenAddress)}
                disableFavorite={
                  hasReachedFavoriteLimit &&
                  !isDaoFavorited(dao.chainId, dao.dao.tokenAddress)
                }
                favoriteDisabledTooltip={`Favorite limit reached (${FAVORITE_DAO_LIMIT})`}
                onFavoriteToggle={isWalletConnected ? toggleFavorite : undefined}
              />
            )
          })}
        </Grid>
      ) : (
        <ExploreNoDaos />
      )}
    </>
  )
}

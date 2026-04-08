import { DaoCard } from '@buildeross/dao-ui'
import {
  type DaoSearchResult,
  type ExploreDaoWithChainId,
} from '@buildeross/sdk/subgraph'
import { AddressType } from '@buildeross/types'
import React from 'react'
import {
  buildFavoriteDao,
  FAVORITE_DAO_LIMIT,
  type FavoriteDao,
} from 'src/hooks/useFavoriteDaos'
import { formatEther } from 'viem'

type ExploreDaoCardProps = {
  dao: ExploreDaoWithChainId | DaoSearchResult | FavoriteDao
  isFavorited?: boolean
  disableFavorite?: boolean
  onFavoriteToggle?: (favorite: FavoriteDao) => void
}

const isExploreDaoWithChainId = (
  dao: ExploreDaoWithChainId | DaoSearchResult | FavoriteDao
): dao is ExploreDaoWithChainId | DaoSearchResult => {
  return 'dao' in dao
}

export const ExploreDaoCard: React.FC<ExploreDaoCardProps> = ({
  dao,
  isFavorited = false,
  disableFavorite = false,
  onFavoriteToggle,
}) => {
  const favorite = React.useMemo(
    () => (isExploreDaoWithChainId(dao) ? buildFavoriteDao(dao) : dao),
    [dao]
  )

  const bid = isExploreDaoWithChainId(dao)
    ? (dao.highestBid?.amount ?? undefined)
    : (favorite.bid ?? undefined)
  const bidInEth = bid ? formatEther(BigInt(bid)) : undefined

  return (
    <DaoCard
      chainId={favorite.chainId}
      collectionAddress={favorite.collectionAddress as AddressType}
      tokenId={favorite.tokenId}
      tokenImage={favorite.tokenImage}
      tokenName={favorite.tokenName}
      collectionName={favorite.collectionName}
      bid={bidInEth}
      endTime={favorite.endTime}
      isFavorited={isFavorited}
      favoriteDisabled={disableFavorite}
      onFavoriteToggle={onFavoriteToggle ? () => onFavoriteToggle(favorite) : undefined}
    />
  )
}

export { FAVORITE_DAO_LIMIT }

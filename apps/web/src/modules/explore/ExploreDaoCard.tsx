import { DaoCard } from '@buildeross/dao-ui'
import {
  type DaoSearchResult,
  type ExploreDaoWithChainId,
} from '@buildeross/sdk/subgraph'
import { AddressType } from '@buildeross/types'
import { Box, PopUp, Text } from '@buildeross/zord'
import React from 'react'
import { buildFavoriteDao, type FavoriteDao } from 'src/hooks/useFavoriteDaos'
import { formatEther } from 'viem'

type ExploreDaoCardProps = {
  dao: ExploreDaoWithChainId | DaoSearchResult | FavoriteDao
  isFavorited?: boolean
  disableFavorite?: boolean
  favoriteDisabledTooltip?: string
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
  favoriteDisabledTooltip,
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
  const endTimeNum = React.useMemo(() => {
    if (typeof favorite.endTime === 'number') return favorite.endTime
    if (typeof favorite.endTime === 'string') {
      const parsed = Number(favorite.endTime)
      return Number.isNaN(parsed) ? undefined : parsed
    }
    return undefined
  }, [favorite.endTime])
  const [showDisabledFavoriteTooltip, setShowDisabledFavoriteTooltip] =
    React.useState(false)
  const cardRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <>
      <Box
        ref={cardRef}
        onMouseOver={() => {
          if (disableFavorite && favoriteDisabledTooltip) {
            setShowDisabledFavoriteTooltip(true)
          }
        }}
        onMouseLeave={() => setShowDisabledFavoriteTooltip(false)}
      >
        <DaoCard
          chainId={favorite.chainId}
          collectionAddress={favorite.collectionAddress as AddressType}
          tokenId={favorite.tokenId}
          tokenImage={favorite.tokenImage}
          tokenName={favorite.tokenName}
          collectionName={favorite.collectionName}
          bid={bidInEth}
          endTime={endTimeNum}
          isFavorited={isFavorited}
          favoriteDisabled={disableFavorite}
          onFavoriteToggle={
            onFavoriteToggle ? () => onFavoriteToggle(favorite) : undefined
          }
        />
      </Box>
      <PopUp
        open={showDisabledFavoriteTooltip}
        placement="top"
        showBackdrop={false}
        triggerRef={cardRef.current}
      >
        <Text align="center">{favoriteDisabledTooltip}</Text>
      </PopUp>
    </>
  )
}

import { useDaoAuction } from '@buildeross/hooks/useDaoAuction'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import React from 'react'
import { DaoCard } from 'src/modules/dao'
import { DaoProps } from 'src/pages'
import { useChainStore } from 'src/stores'

import { DaoFeedCardSkeleton } from './DaoFeedSkeleton'

interface DaoCardProps {
  dao: DaoProps
}

export const DaoFeedCard: React.FC<DaoCardProps> = ({ dao }) => {
  const chain = useChainStore((x) => x.chain)
  const { highestBid, tokenId, tokenUri, endTime } = useDaoAuction({
    collectionAddress: dao.tokenAddress,
    auctionAddress: dao.auctionAddress,
    chainId: chain.id,
  })
  const getDaoLink = React.useCallback(
    (
      chainId: CHAIN_ID,
      tokenAddress: AddressType,
      tokenId?: number | string | bigint
    ) => {
      if (tokenId === undefined || tokenId === null) {
        return {
          href: `/dao/${chainIdToSlug(chainId)}/${tokenAddress}`,
        }
      }
      return {
        href: `/dao/${chainIdToSlug(chainId)}/${tokenAddress}/${tokenId}`,
      }
    },
    []
  )

  if (!tokenUri?.image || !tokenUri?.name) {
    return <DaoFeedCardSkeleton />
  }

  return (
    <DaoCard
      chainId={chain.id}
      tokenId={tokenId}
      tokenName={tokenUri?.name}
      tokenImage={tokenUri?.image}
      collectionName={dao?.name}
      collectionAddress={dao.tokenAddress}
      bid={highestBid}
      endTime={endTime as number}
      getDaoLink={getDaoLink}
    />
  )
}

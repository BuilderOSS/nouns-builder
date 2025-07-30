import { useDaoAuction } from '@buildeross/hooks/useDaoAuction'
import React from 'react'
import { DaoCard } from 'src/modules/dao'
import { DaoProps } from 'src/pages'
import { useChainStore } from 'src/stores/useChainStore'

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

  if (!tokenUri?.image || !tokenUri?.name) {
    return <DaoFeedCardSkeleton />
  }

  return (
    <DaoCard
      chainId={chain.id}
      tokenName={tokenUri?.name}
      tokenImage={tokenUri?.image}
      tokenId={tokenId?.toString()}
      collectionName={dao?.name}
      collectionAddress={dao.tokenAddress}
      bid={highestBid}
      endTime={endTime as number}
    />
  )
}

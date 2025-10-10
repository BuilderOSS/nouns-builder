import { useDaoAuction } from '@buildeross/hooks/useDaoAuction'
import { useRouter } from 'next/router'
import React from 'react'
import { DaoCard } from 'src/modules/dao'
import { DaoProps } from 'src/pages'
import { useChainStore } from 'src/stores'

import { DaoFeedCardSkeleton } from './DaoFeedSkeleton'

interface DaoCardProps {
  dao: DaoProps
}

export const DaoFeedCard: React.FC<DaoCardProps> = ({ dao }) => {
  const { push } = useRouter()
  const chain = useChainStore((x) => x.chain)
  const { highestBid, tokenId, tokenUri, endTime } = useDaoAuction({
    collectionAddress: dao.tokenAddress,
    auctionAddress: dao.auctionAddress,
    chainId: chain.id,
  })

  const onOpenDao = React.useCallback(
    (tokenAddress: string, tokenId?: number | string | bigint) => {
      if (tokenId === undefined || tokenId === null) {
        push({
          pathname: `/dao/[network]/[token]`,
          query: {
            network: chain.slug,
            token: tokenAddress,
          },
        })
        return
      }
      push({
        pathname: `/dao/[network]/[token]/[tokenId]`,
        query: {
          network: chain.slug,
          token: tokenAddress,
          tokenId: tokenId.toString(),
        },
      })
    },
    [chain.slug, push]
  )

  if (!tokenUri?.image || !tokenUri?.name) {
    return <DaoFeedCardSkeleton />
  }

  return (
    <DaoCard
      chainId={chain.id}
      tokenName={tokenUri?.name}
      tokenImage={tokenUri?.image}
      collectionName={dao?.name}
      bid={highestBid}
      endTime={endTime as number}
      onClick={() => onOpenDao(dao.tokenAddress, tokenId)}
    />
  )
}

import { DaoCard } from '@buildeross/dao-ui'
import { useExploreUserDaos as useMyDaos } from '@buildeross/hooks/useExploreUserDaos'
import { Grid } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'

import { exploreGrid } from './Explore.css'
import { ExploreNoDaos } from './ExploreNoDaos'
import { ExploreSkeleton } from './ExploreSkeleton'
import { ExploreToolbar } from './ExploreToolbar'

export const ExploreMyDaos = () => {
  const { address } = useAccount()

  const { daos, isLoading } = useMyDaos({ address })

  return (
    <>
      <ExploreToolbar title={`My DAOs`} />
      {isLoading ? (
        <ExploreSkeleton />
      ) : daos?.length ? (
        <Grid className={exploreGrid} mb={'x16'}>
          {daos.map((dao) => {
            const bid = dao.highestBid?.amount ?? undefined
            const bidInEth = bid ? formatEther(bid) : undefined
            if (!dao.chainId) return null

            return (
              <DaoCard
                key={dao.dao.tokenAddress}
                chainId={dao.chainId}
                tokenId={dao.token?.tokenId ?? undefined}
                tokenImage={dao.token?.image ?? undefined}
                tokenName={dao.token?.name ?? undefined}
                collectionName={dao.dao.name ?? undefined}
                collectionAddress={dao.dao.tokenAddress}
                bid={bidInEth}
                endTime={dao.endTime ?? undefined}
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

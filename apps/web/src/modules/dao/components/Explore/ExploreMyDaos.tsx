import SWR_KEYS from '@buildeross/constants/swrKeys'
import { exploreMyDaosRequest } from '@buildeross/sdk/subgraph'
import { Grid } from '@buildeross/zord'
import React from 'react'
import useSWR from 'swr'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'

import { DaoCard } from '../DaoCard'
import { exploreGrid } from './Explore.css'
import ExploreNoDaos from './ExploreNoDaos'
import { ExploreSkeleton } from './ExploreSkeleton'
import ExploreToolbar from './ExploreToolbar'

export const ExploreMyDaos = () => {
  const { address } = useAccount()

  const { data, error, isValidating } = useSWR(
    address ? ([SWR_KEYS.DYNAMIC.MY_DAOS_PAGE(address), address] as const) : null,
    ([, _address]) => exploreMyDaosRequest(_address),
    { revalidateOnFocus: false }
  )

  const isLoading = data ? false : isValidating && !data && !error

  return (
    <>
      <ExploreToolbar title={`My DAOs`} />
      {isLoading ? (
        <ExploreSkeleton />
      ) : data?.daos?.length ? (
        <Grid className={exploreGrid} mb={'x16'}>
          {data.daos.map((dao) => {
            const bid = dao.highestBid?.amount ?? undefined
            const bidInEth = bid ? formatEther(bid) : undefined

            return (
              <DaoCard
                chainId={dao.chainId!}
                tokenId={dao.token?.tokenId ?? undefined}
                key={dao.dao.tokenAddress}
                tokenImage={dao.token?.image ?? undefined}
                tokenName={dao.token?.name ?? undefined}
                collectionAddress={dao.dao.tokenAddress as string}
                collectionName={dao.dao.name ?? undefined}
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

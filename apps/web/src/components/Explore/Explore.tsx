import { useQueryParams } from '@buildeross/hooks/useQueryParams'
import { ExploreDaosResponse } from '@buildeross/sdk/subgraph'
import { Grid, Text } from '@buildeross/zord'
import React, { Fragment } from 'react'
import Pagination from 'src/components/Pagination'
import { DaoCard } from 'src/modules/dao/components/DaoCard'
import { useChainStore } from 'src/stores'
import { formatEther } from 'viem'

import { exploreGrid } from './Explore.css'
import ExploreNoDaos from './ExploreNoDaos'
import { ExploreSkeleton } from './ExploreSkeleton'
import ExploreToolbar from './ExploreToolbar'

interface ExploreProps extends Partial<ExploreDaosResponse> {
  isLoading: boolean
  hasNextPage: boolean
}

export const Explore: React.FC<ExploreProps> = ({ daos, hasNextPage, isLoading }) => {
  const query = useQueryParams()
  const chain = useChainStore((x) => x.chain)

  const page = query.page

  return (
    <Fragment>
      <ExploreToolbar title={`DAOs on ${chain.name}`} showSort />
      {daos?.length ? (
        <Fragment>
          <Grid className={exploreGrid}>
            {daos?.map((dao) => {
              const bid = dao.highestBid?.amount ?? undefined
              const bidInEth = bid ? formatEther(bid) : undefined

              return (
                <DaoCard
                  tokenId={dao.token?.tokenId ?? undefined}
                  chainId={chain.id}
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
          <Pagination hasNextPage={hasNextPage} scroll={true} />
        </Fragment>
      ) : isLoading ? (
        <ExploreSkeleton />
      ) : !page ? (
        <ExploreNoDaos />
      ) : (
        <Fragment>
          <Text
            style={{ maxWidth: 912, minHeight: 250, padding: '150px 0px' }}
            variant={'paragraph-md'}
            color={'tertiary'}
          >
            There are no DAOs here
          </Text>

          <Pagination hasNextPage={hasNextPage} />
        </Fragment>
      )}
    </Fragment>
  )
}

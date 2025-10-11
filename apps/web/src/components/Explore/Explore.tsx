import { ExploreDaosResponse } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { Grid, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
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
  const { query } = useRouter()
  const chain = useChainStore((x) => x.chain)

  const page = query.page

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
                  chainId={chain.id}
                  key={dao.dao.tokenAddress}
                  tokenId={dao.token?.tokenId ?? undefined}
                  tokenImage={dao.token?.image ?? undefined}
                  tokenName={dao.token?.name ?? undefined}
                  collectionName={dao.dao.name ?? undefined}
                  collectionAddress={dao.dao.tokenAddress}
                  bid={bidInEth}
                  endTime={dao.endTime ?? undefined}
                  getDaoLink={getDaoLink}
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

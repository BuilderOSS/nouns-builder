import SWR_KEYS from '@buildeross/constants/swrKeys'
import { highestBidsRequest } from '@buildeross/sdk/subgraph'
import { Flex, Grid } from '@buildeross/zord'
import React, { ReactNode } from 'react'
import RecentlyCreated from 'src/components/Home/RecentlyCreated'
import { DaoProps } from 'src/pages'
import { useChainStore } from 'src/stores'
import useSWR from 'swr'

import { DaoErrorFeed } from './DaoErrorFeed'
import { daoFeedGrid } from './DaoFeed.css'
import { DaoFeedCard } from './DaoFeedCard'
import { DaoFeedSkeleton } from './DaoFeedSkeleton'

export const GridContainer = ({ children }: { children: ReactNode }) => (
  <Flex direction={'row'} justify={'center'} mt={'x3'}>
    <Grid className={daoFeedGrid}>{children}</Grid>
  </Flex>
)

const DaoFeedContent = ({
  loading,
  error,
  featuredDaos,
}: {
  loading: boolean
  error: boolean
  featuredDaos?: Array<DaoProps>
}) => {
  if (loading) return <DaoFeedSkeleton />
  if (error) return <DaoErrorFeed />
  return (
    <GridContainer>
      {featuredDaos?.map((dao, index) => <DaoFeedCard key={index} dao={dao} />)}
    </GridContainer>
  )
}

type DaoFeedProps = {
  isDashboard?: boolean
}

export const DaoFeed = ({ isDashboard }: DaoFeedProps) => {
  const chain = useChainStore((x) => x.chain)
  const { data: featuredDaos, error } = useSWR([SWR_KEYS.FEATURED, chain.id], async () =>
    highestBidsRequest(chain.id)
  )

  const isLoading = !featuredDaos && !error
  const hasThreeDaos = featuredDaos ? featuredDaos.data.length > 2 : false
  const hasError = featuredDaos ? featuredDaos?.statusCode >= 500 : false

  if (!isLoading && !hasError && !hasThreeDaos) return null

  return (
    <RecentlyCreated isDashboard={isDashboard}>
      <DaoFeedContent
        loading={isLoading}
        error={hasError}
        featuredDaos={featuredDaos?.data}
      />
    </RecentlyCreated>
  )
}

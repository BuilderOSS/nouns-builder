import { AuctionFragment } from '@buildeross/sdk/subgraph'
import { Stack } from '@buildeross/zord'
import React from 'react'
import { useAccount } from 'wagmi'

import Everything from 'src/components/Home/Everything'
import FAQ from 'src/components/Home/FAQ'
import GetStarted from 'src/components/Home/GetStarted'
import Marquee from 'src/components/Home/Marquee'
import Twitter from 'src/components/Home/Twitter'
import VisitAlternate from 'src/components/Home/VisitAlternate'
import { Meta } from 'src/components/Meta'
import { DefaultLayout } from 'src/layouts/DefaultLayout'
import { HomeLayout } from 'src/layouts/HomeLayout'
import { LayoutWrapper } from 'src/layouts/LayoutWrapper'
import { DaoFeed } from 'src/modules/dao'
import Dashboard from 'src/modules/dashboard/Dashboard'

import { NextPageWithLayout } from './_app'

export type DaoProps = AuctionFragment['dao']

const HomePage: NextPageWithLayout = () => {
  const { address } = useAccount()

  if (address) {
    return (
      <LayoutWrapper>
        <DefaultLayout>
          <Meta title={'Nouns your ideas'} type={'website'} path={'/'} />
          <Dashboard />
        </DefaultLayout>
      </LayoutWrapper>
    )
  }
  return (
    <LayoutWrapper>
      <HomeLayout>
        <Meta title={'Nouns your ideas'} type={'website'} path={'/'} />
        <Stack align={'center'}>
          <Marquee />
          <GetStarted />
          <VisitAlternate />
          <DaoFeed />
          <Everything />
          <FAQ />
          <Twitter />
        </Stack>
      </HomeLayout>
    </LayoutWrapper>
  )
}

// HomePage.getLayout = getHomeLayout

export default HomePage

import { AuctionFragment } from '@buildeross/sdk/subgraph'
import { useAuthStore } from '@buildeross/stores'
import { Stack } from '@buildeross/zord'
import React, { ReactNode } from 'react'
import { Meta } from 'src/components/Meta'
import { DefaultLayout } from 'src/layouts/DefaultLayout'
import { HomeLayout } from 'src/layouts/HomeLayout'
import { LayoutWrapper } from 'src/layouts/LayoutWrapper'
import { DaoFeed, Dashboard } from 'src/modules/dashboard'
import {
  Everything,
  FAQ,
  GetStarted,
  Marquee,
  Twitter,
  VisitAlternate,
} from 'src/modules/home'
import { container } from 'src/styles/dashboard.css'

import { NextPageWithLayout } from './_app'

export type DaoProps = AuctionFragment['dao']

function ConditionalLayout({ children }: { children: ReactNode }) {
  const { address } = useAuthStore()

  if (address) {
    return (
      <LayoutWrapper>
        <DefaultLayout hideFooterOnMobile={true} className={container}>
          {children}
        </DefaultLayout>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <HomeLayout>{children}</HomeLayout>
    </LayoutWrapper>
  )
}

const HomePage: NextPageWithLayout = () => {
  const { address } = useAuthStore()

  return (
    <>
      <Meta title={'Nouns your ideas'} type={'website'} path={'/'} />
      {address ? (
        <Dashboard />
      ) : (
        <Stack align={'center'}>
          <Marquee />
          <GetStarted />
          <VisitAlternate />
          <DaoFeed />
          <Everything />
          <FAQ />
          <Twitter />
        </Stack>
      )}
    </>
  )
}

HomePage.getLayout = (page) => {
  // We need to check the page content to determine layout
  // Since we can't access useAuthStore here, we'll create a wrapper that handles both cases
  return <ConditionalLayout>{page}</ConditionalLayout>
}

export default HomePage

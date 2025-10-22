import { AuctionFragment } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { Stack } from '@buildeross/zord'
import { useRouter } from 'next/router'
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
import { useAccount } from 'wagmi'

import { NextPageWithLayout } from './_app'

export type DaoProps = AuctionFragment['dao']

function ConditionalLayout({ children }: { children: ReactNode }) {
  const { address } = useAccount()

  if (address) {
    return (
      <LayoutWrapper>
        <DefaultLayout>{children}</DefaultLayout>
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
  const { address } = useAccount()
  const { push } = useRouter()

  const handleOpenCreateProposal = (chainId: CHAIN_ID, tokenAddress: AddressType) => {
    push({
      pathname: `/dao/[network]/[token]/proposal/create`,
      query: {
        network: chainIdToSlug(chainId),
        token: tokenAddress,
      },
    })
  }

  return (
    <>
      <Meta title={'Nouns your ideas'} type={'website'} path={'/'} />
      {address ? (
        <Dashboard handleOpenCreateProposal={handleOpenCreateProposal} />
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
  // Since we can't access useAccount here, we'll create a wrapper that handles both cases
  return <ConditionalLayout>{page}</ConditionalLayout>
}

export default HomePage

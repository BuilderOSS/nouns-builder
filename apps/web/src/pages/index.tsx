import { AuctionFragment } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { Stack } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React, { ReactNode } from 'react'
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
  const getDaoLink = (
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
  }

  const getProposalLink = (
    chainId: CHAIN_ID,
    tokenAddress: AddressType,
    proposalNumber: number
  ) => {
    return {
      href: `/dao/${chainIdToSlug(chainId)}/${tokenAddress}/vote/${proposalNumber}`,
    }
  }

  return (
    <>
      <Meta title={'Nouns your ideas'} type={'website'} path={'/'} />
      {address ? (
        <Dashboard
          handleOpenCreateProposal={handleOpenCreateProposal}
          getDaoLink={getDaoLink}
          getProposalLink={getProposalLink}
        />
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

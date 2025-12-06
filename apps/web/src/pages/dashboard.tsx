import { AddressType, CHAIN_ID } from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { useRouter } from 'next/router'
import React from 'react'
import { Meta } from 'src/components/Meta'
import { DefaultLayout } from 'src/layouts/DefaultLayout'
import { LayoutWrapper } from 'src/layouts/LayoutWrapper'
import { Dashboard } from 'src/modules/dashboard'

const DashboardPage = () => {
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
      <Meta title={'Dashboard'} type={'website'} path={'/dashboard'} />
      <Dashboard handleOpenCreateProposal={handleOpenCreateProposal} />
    </>
  )
}

DashboardPage.getLayout = (page: React.ReactElement) => {
  return (
    <LayoutWrapper>
      <DefaultLayout hideFooterOnMobile={true}>{page}</DefaultLayout>
    </LayoutWrapper>
  )
}

export default DashboardPage

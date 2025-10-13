import { AddressType, CHAIN_ID } from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { useRouter } from 'next/router'
import React from 'react'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
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

DashboardPage.getLayout = getDefaultLayout

export default DashboardPage

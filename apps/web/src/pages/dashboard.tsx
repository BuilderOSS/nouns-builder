import { CHAIN_ID } from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { useRouter } from 'next/router'
import React from 'react'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import Dashboard from 'src/modules/dashboard/Dashboard'

const DashboardPage = () => {
  const { push } = useRouter()

  const handleSelectAuction = (
    chainId: CHAIN_ID,
    tokenAddress: string,
    tokenId: number | undefined = undefined
  ) => {
    if (!tokenId) push(`/dao/${chainIdToSlug(chainId)}/${tokenAddress}`)
    push(`/dao/${chainIdToSlug(chainId)}/${tokenAddress}/${tokenId}`)
  }

  const handleOpenCreateProposal = (chainId: CHAIN_ID, tokenAddress: string) => {
    push(`/dao/${chainIdToSlug(chainId)}/${tokenAddress}/proposal/create`)
  }

  return (
    <>
      <Meta title={'Dashboard'} type={'website'} path={'/dashboard'} />
      <Dashboard
        handleSelectAuction={handleSelectAuction}
        handleOpenCreateProposal={handleOpenCreateProposal}
      />
    </>
  )
}

DashboardPage.getLayout = getDefaultLayout

export default DashboardPage

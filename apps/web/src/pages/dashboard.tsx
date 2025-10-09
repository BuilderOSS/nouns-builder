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
    tokenId?: number | string | bigint
  ) => {
    if (tokenId === undefined || tokenId === null) {
      push({
        pathname: `/dao/[network]/[token]`,
        query: {
          network: chainIdToSlug(chainId),
          token: tokenAddress,
        },
      })
      return
    }
    push({
      pathname: `/dao/[network]/[token]/[tokenId]`,
      query: {
        network: chainIdToSlug(chainId),
        token: tokenAddress,
        tokenId: tokenId.toString(),
      },
    })
  }

  const handleOpenDao = (
    chainId: CHAIN_ID,
    tokenAddress: string,
    tab: string = 'about'
  ) => {
    push({
      pathname: `/dao/[network]/[token]`,
      query: {
        network: chainIdToSlug(chainId),
        token: tokenAddress,
        tab,
      },
    })
  }

  const handleOpenProposal = (
    chainId: CHAIN_ID,
    tokenAddress: string,
    proposalNumber: number
  ) => {
    push({
      pathname: `/dao/[network]/[token]/vote/[id]`,
      query: {
        network: chainIdToSlug(chainId),
        token: tokenAddress,
        id: proposalNumber.toString(),
      },
    })
  }

  const handleOpenCreateProposal = (chainId: CHAIN_ID, tokenAddress: string) => {
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
      <Dashboard
        handleSelectAuction={handleSelectAuction}
        handleOpenCreateProposal={handleOpenCreateProposal}
        handleOpenDao={handleOpenDao}
        handleOpenProposal={handleOpenProposal}
      />
    </>
  )
}

DashboardPage.getLayout = getDefaultLayout

export default DashboardPage

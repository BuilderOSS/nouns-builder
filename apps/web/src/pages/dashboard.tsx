import { AddressType, CHAIN_ID } from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { useRouter } from 'next/router'
import React from 'react'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import Dashboard from 'src/modules/dashboard/Dashboard'

const DashboardPage = () => {
  const { push } = useRouter()

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
      <Dashboard
        handleOpenCreateProposal={handleOpenCreateProposal}
        getDaoLink={getDaoLink}
        getProposalLink={getProposalLink}
      />
    </>
  )
}

DashboardPage.getLayout = getDefaultLayout

export default DashboardPage

import { Activity } from '@buildeross/dao-ui'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { getDaoConfig } from '@/config'

const ProposalsPage: NextPage = () => {
  const { push } = useRouter()
  const daoConfig = getDaoConfig()

  const onOpenProposalCreate = React.useCallback(async () => {
    await push('/proposal/create')
  }, [push])

  const onOpenProposalReview = React.useCallback(async () => {
    await push('/proposal/review')
  }, [push])

  return (
    <>
      <Head>
        <title>{`Proposals | ${daoConfig.name}`}</title>
        <meta name="description" content={`${daoConfig.name} Proposals`} />
        <meta property="og:title" content={`Proposals | ${daoConfig.name}`} />
        <meta property="og:description" content={`${daoConfig.name} Proposals`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ paddingTop: 40 }}>
        <Activity
          onOpenProposalCreate={onOpenProposalCreate}
          onOpenProposalReview={onOpenProposalReview}
        />
      </main>
    </>
  )
}

export default ProposalsPage

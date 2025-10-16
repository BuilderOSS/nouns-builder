import { Activity } from '@buildeross/dao-ui'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

const ProposalsPage: NextPage = () => {
  const { push } = useRouter()

  const onOpenProposalCreate = React.useCallback(async () => {
    await push('/proposal/create')
  }, [push])

  const onOpenProposalReview = React.useCallback(async () => {
    await push('/proposal/review')
  }, [push])

  return (
    <>
      <Head>
        <title>Proposals | DAO</title>
        <meta name="description" content="DAO Proposals" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Activity
          onOpenProposalCreate={onOpenProposalCreate}
          onOpenProposalReview={onOpenProposalReview}
        />
      </main>
    </>
  )
}

export default ProposalsPage

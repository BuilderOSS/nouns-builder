import { SmartContracts } from '@buildeross/dao-ui'
import { NextPage } from 'next'
import Head from 'next/head'

import { getDaoConfig } from '@/config'

const ContractsPage: NextPage = () => {
  const daoConfig = getDaoConfig()

  return (
    <>
      <Head>
        <title>{`Smart Contracts | ${daoConfig.name}`}</title>
        <meta name="description" content={`${daoConfig.name} Smart Contracts`} />
        <meta property="og:title" content={`Smart Contracts | ${daoConfig.name}`} />
        <meta property="og:description" content={`${daoConfig.name} Smart Contracts`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <SmartContracts />
      </main>
    </>
  )
}

export default ContractsPage

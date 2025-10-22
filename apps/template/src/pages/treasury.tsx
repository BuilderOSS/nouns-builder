import { Treasury } from '@buildeross/dao-ui'
import { NextPage } from 'next'
import Head from 'next/head'

import { getDaoConfig } from '@/config'

const TreasuryPage: NextPage = () => {
  const daoConfig = getDaoConfig()

  return (
    <>
      <Head>
        <title>{`Treasury | ${daoConfig.name}`}</title>
        <meta name="description" content={`${daoConfig.name} Treasury`} />
        <meta property="og:title" content={`Treasury | ${daoConfig.name}`} />
        <meta property="og:description" content={`${daoConfig.name} Treasury`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Treasury />
      </main>
    </>
  )
}

export default TreasuryPage

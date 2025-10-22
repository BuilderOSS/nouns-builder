import { About } from '@buildeross/dao-ui'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { getDaoConfig } from '@/config'

const AboutPage: NextPage = () => {
  const { push } = useRouter()
  const daoConfig = getDaoConfig()

  const onOpenTreasury = React.useCallback(async () => {
    await push('/treasury')
  }, [push])

  return (
    <>
      <Head>
        <title>{`About | ${daoConfig.name}`}</title>
        <meta name="description" content={`About ${daoConfig.name}`} />
        <meta property="og:title" content={`About | ${daoConfig.name}`} />
        <meta property="og:description" content={`About ${daoConfig.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <About onOpenTreasury={onOpenTreasury} />
      </main>
    </>
  )
}

export default AboutPage

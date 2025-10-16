import { About } from '@buildeross/dao-ui'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

const AboutPage: NextPage = () => {
  const { push } = useRouter()

  const onOpenTreasury = React.useCallback(async () => {
    await push('/treasury')
  }, [push])

  return (
    <>
      <Head>
        <title>About | DAO</title>
        <meta name="description" content="About our DAO" />
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

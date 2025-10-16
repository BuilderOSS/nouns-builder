import { Treasury } from '@buildeross/dao-ui'
import { NextPage } from 'next'
import Head from 'next/head'

const TreasuryPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Treasury | DAO</title>
        <meta name="description" content="DAO Treasury" />
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

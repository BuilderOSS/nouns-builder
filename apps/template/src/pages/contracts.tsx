import { SmartContracts } from '@buildeross/dao-ui'
import { NextPage } from 'next'
import Head from 'next/head'

const ContractsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Smart Contracts | DAO</title>
        <meta name="description" content="DAO Smart Contracts" />
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

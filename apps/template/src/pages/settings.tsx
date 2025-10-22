import { Admin } from '@buildeross/dao-ui'
import { Flex } from '@buildeross/zord'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { useAccount } from 'wagmi'

import { getDaoConfig } from '@/config'
import { useSettingsAccess } from '@/hooks/useSettingsAccess'

const SettingsPage: NextPage = () => {
  const { push } = useRouter()
  const { address } = useAccount()
  const { isLoading, hasAccess } = useSettingsAccess()
  const daoConfig = getDaoConfig()

  const onOpenProposalReview = React.useCallback(async () => {
    await push('/proposal/review')
  }, [push])

  if (isLoading) return null

  if (!address)
    return (
      <>
        <Head>
          <title>{`Settings | ${daoConfig.name}`}</title>
          <meta name="description" content={`${daoConfig.name} Admin Settings`} />
          <meta property="og:title" content={`Settings | ${daoConfig.name}`} />
          <meta property="og:description" content={`${daoConfig.name} Admin Settings`} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
          Please connect your wallet to access this page
        </Flex>
      </>
    )

  if (!hasAccess) {
    return (
      <>
        <Head>
          <title>{`Settings | ${daoConfig.name}`}</title>
          <meta name="description" content={`${daoConfig.name} Admin Settings`} />
          <meta property="og:title" content={`Settings | ${daoConfig.name}`} />
          <meta property="og:description" content={`${daoConfig.name} Admin Settings`} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
          Access Restricted - You don't have permission to access this page
        </Flex>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{`Settings | ${daoConfig.name}`}</title>
        <meta name="description" content={`${daoConfig.name} Admin Settings`} />
        <meta property="og:title" content={`Settings | ${daoConfig.name}`} />
        <meta property="og:description" content={`${daoConfig.name} Admin Settings`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Admin onOpenProposalReview={onOpenProposalReview} />
      </main>
    </>
  )
}

export default SettingsPage

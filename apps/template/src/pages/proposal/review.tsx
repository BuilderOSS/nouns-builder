import { SUCCESS_MESSAGES } from '@buildeross/constants/messages'
import { CreateProposalHeading, ReviewProposalForm } from '@buildeross/create-proposal-ui'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useVotes } from '@buildeross/hooks/useVotes'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { atoms, Box, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { useAccount } from 'wagmi'

import { getDaoConfig } from '@/config'

const ReviewProposalPage: NextPage = () => {
  const chain = useChainStore((x) => x.chain)
  const { back, push } = useRouter()
  const daoConfig = getDaoConfig()

  const { addresses } = useDaoStore()
  const { address } = useAccount()

  const { isLoading, hasThreshold } = useVotes({
    chainId: chain.id,
    governorAddress: addresses.governor,
    signerAddress: address,
    collectionAddress: addresses.token,
  })

  const { isGovernanceDelayed } = useDelayedGovernance({
    chainId: chain.id,
    tokenAddress: addresses.token,
    governorAddress: addresses.governor,
  })

  const { transactions, disabled, title, summary } = useProposalStore()

  const onProposalCreated = React.useCallback(async () => {
    await push({
      pathname: '/proposals',
      query: {
        message: SUCCESS_MESSAGES.PROPOSAL_SUBMISSION_SUCCESS,
      },
    })
  }, [push])

  const onEditTransactions = React.useCallback(async () => {
    await push('/proposal/create')
  }, [push])

  if (isLoading) return null

  if (!address)
    return (
      <>
        <Head>
          <title>{`Review Proposal | ${daoConfig.name}`}</title>
          <meta name="description" content="Review and submit DAO proposal" />
          <meta property="og:title" content="Review Proposal | DAO" />
          <meta property="og:description" content="Review and submit DAO proposal" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
          Please connect your wallet to access this page
        </Flex>
      </>
    )

  if (!hasThreshold || isGovernanceDelayed) {
    return (
      <>
        <Head>
          <title>{`Review Proposal | ${daoConfig.name}`}</title>
          <meta name="description" content="Review and submit DAO proposal" />
          <meta property="og:title" content="Review Proposal | DAO" />
          <meta property="og:description" content="Review and submit DAO proposal" />
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
        <title>{`Review Proposal | ${daoConfig.name}`}</title>
        <meta
          name="description"
          content={`Review and submit ${daoConfig.name} proposal`}
        />
        <meta property="og:title" content={`Review Proposal | ${daoConfig.name}`} />
        <meta
          property="og:description"
          content={`Review and submit ${daoConfig.name} proposal`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack w={'100%'} px={'x3'} style={{ maxWidth: 1060 }} mx="auto">
        <CreateProposalHeading
          title={'Review and Submit Proposal'}
          align={'center'}
          handleBack={back}
        />
        <Box mx="auto">
          <a href="/guidelines" target="_blank" rel="noreferrer noopener">
            <Flex align={'center'} mb={'x10'} color="text1">
              <Text
                fontSize={{ '@initial': 14, '@768': 18 }}
                fontWeight={'paragraph'}
                className={atoms({ textDecoration: 'underline' })}
              >
                Tips on how to write great proposals
              </Text>
              <Icon fill="text1" size="sm" ml="x1" id="external-16" />
            </Flex>
          </a>
        </Box>
        <Stack w={'100%'} px={'x3'} style={{ maxWidth: 680 }} mx="auto">
          <ReviewProposalForm
            disabled={disabled}
            transactions={transactions}
            title={title}
            summary={summary}
            onProposalCreated={onProposalCreated}
            onEditTransactions={onEditTransactions}
          />
        </Stack>
      </Stack>
    </>
  )
}

export default ReviewProposalPage

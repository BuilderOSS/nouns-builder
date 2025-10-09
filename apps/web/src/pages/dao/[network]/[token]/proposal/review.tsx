import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { SUCCESS_MESSAGES } from '@buildeross/constants/messages'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useVotes } from '@buildeross/hooks/useVotes'
import { getDAOAddresses } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { atoms, Box, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import {
  CreateProposalHeading,
  ReviewProposalForm,
  useProposalStore,
} from 'src/modules/create-proposal'
import { NextPageWithLayout } from 'src/pages/_app'
import { useChainStore, useDaoStore } from 'src/stores'
import { notFoundWrap } from 'src/styles/404.css'
import { useAccount } from 'wagmi'

const ReviewProposalPage: NextPageWithLayout = () => {
  const chain = useChainStore((x) => x.chain)
  const { back, push } = useRouter()

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
      pathname: `/dao/[network]/[token]`,
      query: {
        network: chain.slug,
        token: addresses.token,
        message: SUCCESS_MESSAGES.PROPOSAL_SUBMISSION_SUCCESS,
        tab: 'activity',
      },
    })
  }, [push, chain.slug, addresses.token])

  const onEditTransactions = React.useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]/proposal/create`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [push, chain.slug, addresses.token])

  if (isLoading) return null

  if (!address)
    return (
      <Flex className={notFoundWrap}>Please connect your wallet to access this page</Flex>
    )

  if (!hasThreshold || isGovernanceDelayed) {
    return (
      <Flex className={notFoundWrap}>
        Access Restricted - You don’t have permission to access this page
      </Flex>
    )
  }

  return (
    <Stack mb={'x20'} w={'100%'} px={'x3'} style={{ maxWidth: 1060 }} mx="auto">
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
  )
}

ReviewProposalPage.getLayout = getDaoLayout

export default ReviewProposalPage

export const getServerSideProps: GetServerSideProps = async ({ res, params }) => {
  const { maxAge, swr } = CACHE_TIMES.DAO_PROPOSAL
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  const collection = params?.token as AddressType
  const network = params?.network as string

  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)

  if (!chain)
    return {
      notFound: true,
    }

  const addresses = await getDAOAddresses(chain.id, collection)

  if (!addresses) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      addresses,
      chainId: chain.id,
    },
  }
}

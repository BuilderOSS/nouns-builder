import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { CreateProposalHeading, ReviewProposalForm } from '@buildeross/create-proposal-ui'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useVotes } from '@buildeross/hooks/useVotes'
import { getDAOAddresses } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { atoms, Box, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { notFoundWrap } from 'src/styles/404.css'
import { useAccount } from 'wagmi'

const ReviewProposalPage: NextPageWithLayout = () => {
  const chain = useChainStore((x) => x.chain)
  const { push } = useRouter()

  const [proposalIdCreated, setProposalIdCreated] = React.useState<
    string | null | undefined
  >(undefined)

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

  const onProposalCreated = (proposalId: string | null) => {
    setProposalIdCreated(proposalId)
  }

  const onOpenCreatePage = React.useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]/proposal/create`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [push, chain.slug, addresses.token])

  const handleCloseSuccessModal = () => {
    if (proposalIdCreated) {
      push({
        pathname: `/dao/[network]/[token]/vote/[id]`,
        query: {
          network: chain.slug,
          token: addresses.token,
          id: proposalIdCreated,
        },
      })
    } else {
      push({
        pathname: `/dao/[network]/[token]`,
        query: {
          network: chain.slug,
          token: addresses.token,
          tab: 'activity',
        },
      })
    }
    setProposalIdCreated(undefined)
  }

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
        handleBack={onOpenCreatePage}
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
        />
      </Stack>

      <AnimatedModal
        open={proposalIdCreated !== undefined}
        close={handleCloseSuccessModal}
      >
        <SuccessModalContent
          title={`Proposal submitted`}
          subtitle={`Your Proposal has been successfully submitted!`}
          success
        />
      </AnimatedModal>
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

import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  CreateProposalHeading,
  ProposalStageIndicator,
  ReviewProposalForm,
} from '@buildeross/create-proposal-ui'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useVotes } from '@buildeross/hooks/useVotes'
import { getDAOAddresses } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType, ProposalCreateStage } from '@buildeross/types'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { Flex, Stack } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { notFoundWrap } from 'src/styles/404.css'
import { useAccount } from 'wagmi'

const ReviewProposalPage: NextPageWithLayout = () => {
  const chain = useChainStore((x) => x.chain)
  const { push } = useRouter()

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

  const {
    transactions,
    disabled,
    title,
    summary,
    representedAddress,
    discussionUrl,
    representedAddressEnabled,
    clearProposal,
  } = useProposalStore()
  const [proposalHydrated, setProposalHydrated] = useState(false)

  useEffect(() => {
    if (useProposalStore.persist.hasHydrated()) {
      setProposalHydrated(true)
      return
    }

    const unsubscribe = useProposalStore.persist.onFinishHydration(() => {
      setProposalHydrated(true)
    })

    return unsubscribe
  }, [])

  const onOpenCreatePage = useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]/proposal/create`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [push, chain.slug, addresses.token])

  const onOpenCreateStage = useCallback(
    async (stage: ProposalCreateStage) => {
      await push({
        pathname: `/dao/[network]/[token]/proposal/create`,
        query: {
          network: chain.slug,
          token: addresses.token,
          stage,
        },
      })
    },
    [push, chain.slug, addresses.token]
  )

  const onResetProposal = useCallback(async () => {
    clearProposal()

    await push({
      pathname: `/dao/[network]/[token]/proposal/create`,
      query: {
        network: chain.slug,
        token: addresses.token,
        stage: 'draft',
      },
    })
  }, [clearProposal, push, chain.slug, addresses.token])

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isNavigatingRef = useRef(false)
  const [proposalIdCreated, setProposalIdCreated] = useState<string | null | undefined>(
    undefined
  )

  const handleCloseSuccessModal = useCallback(async () => {
    if (isNavigatingRef.current) return
    isNavigatingRef.current = true

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }

    try {
      if (proposalIdCreated) {
        await push({
          pathname: `/dao/[network]/[token]/vote/[id]`,
          query: {
            network: chain.slug,
            token: addresses.token,
            id: proposalIdCreated,
          },
        })
      } else {
        await push({
          pathname: `/dao/[network]/[token]`,
          query: {
            network: chain.slug,
            token: addresses.token,
            tab: 'activity',
          },
        })
      }
      setProposalIdCreated(undefined)
    } finally {
      isNavigatingRef.current = false
    }
  }, [proposalIdCreated, chain.slug, addresses.token, push])

  const onProposalCreated = useCallback((proposalId: string | null) => {
    setProposalIdCreated(proposalId)
  }, [])

  useEffect(() => {
    if (proposalIdCreated !== undefined) {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
      }
      // Auto-close after 2 seconds
      successTimerRef.current = setTimeout(() => {
        handleCloseSuccessModal()
      }, 2000)
    }

    return () => {
      // Clear timer on unmount
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
    }
  }, [handleCloseSuccessModal, proposalIdCreated])

  useEffect(() => {
    if (!proposalHydrated) return
    if (proposalIdCreated !== undefined) return
    if (transactions.length > 0) return
    if (title?.trim() || summary?.trim()) return

    void push({
      pathname: `/dao/[network]/[token]/proposal/create`,
      query: {
        network: chain.slug,
        token: addresses.token,
        stage: 'draft',
      },
    })
  }, [
    proposalHydrated,
    proposalIdCreated,
    transactions.length,
    title,
    summary,
    push,
    chain.slug,
    addresses.token,
  ])

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
    <Stack
      pb={{ '@initial': 'x30', '@768': 'x0' }}
      w={'100%'}
      px={'x3'}
      style={{ maxWidth: 1060 }}
      mx="auto"
    >
      <CreateProposalHeading
        title={'Review and Submit'}
        handleBack={onOpenCreatePage}
        showHelpLinks
        showStepBack
        onStepBack={() => void onOpenCreateStage('transactions')}
        showContinue={false}
        showQueue={false}
        showReset
        hideActionsOnMobile
        onReset={() => void onResetProposal()}
      />

      <ProposalStageIndicator
        currentStage={'review'}
        onStageSelect={(stage) => {
          if (stage === 'draft' || stage === 'transactions') {
            void onOpenCreateStage(stage)
          }
        }}
        isStageClickable={(stage) => stage === 'draft' || stage === 'transactions'}
      />

      <Stack w={'100%'} px={'x3'} mx="auto">
        <ReviewProposalForm
          disabled={disabled}
          transactions={transactions}
          title={title}
          summary={summary}
          representedAddress={representedAddress}
          discussionUrl={discussionUrl}
          representedAddressEnabled={representedAddressEnabled}
          onProposalCreated={onProposalCreated}
          onBackMobile={() => void onOpenCreateStage('transactions')}
          onResetMobile={() => void onResetProposal()}
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

ReviewProposalPage.getLayout = (page) => getDaoLayout(page, { hideFooterOnMobile: true })

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

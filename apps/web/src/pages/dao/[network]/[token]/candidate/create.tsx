import {
  CandidateDraftForm,
  CandidateSubmitForm,
  CandidateUpdatingBanner,
  getCandidateId,
} from '@buildeross/candidate-ui'
import { ALLOWED_MIGRATION_DAOS } from '@buildeross/constants/addresses'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { L1_CHAINS, PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  CreateProposalHeading,
  MobileProposalActionBar,
  ProposalStageIndicator,
  Queue,
  ResetConfirmationModal,
  TRANSACTION_FORM_OPTIONS,
  TransactionComposerProvider,
  TransactionForm,
  TransactionStageColumn,
  TwoColumnLayout,
} from '@buildeross/create-proposal-ui'
import { useClankerTokens } from '@buildeross/hooks/useClankerTokens'
import { useRendererBaseFix } from '@buildeross/hooks/useRendererBaseFix'
import { useScrollDirection } from '@buildeross/hooks/useScrollDirection'
import { TRANSACTION_TYPES, TransactionTypeIcon } from '@buildeross/proposal-ui'
import { getCandidateGroup } from '@buildeross/sdk'
import { auctionAbi, getDAOAddresses } from '@buildeross/sdk/contract'
import { useCandidateStore, useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType, TransactionType } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import { isChainIdSupportedByDroposal } from '@buildeross/utils/droposal'
import { isChainIdSupportedByEAS } from '@buildeross/utils/eas'
import { isChainIdSupportedBySablier } from '@buildeross/utils/sablier/constants'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { isAddressEqual } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { useShallow } from 'zustand/shallow'

type CreateStage = 'draft' | 'transactions' | 'review'

const createSelectOption = (type: TransactionType) => ({
  value: type,
  label: TRANSACTION_TYPES[type].title,
  description: TRANSACTION_TYPES[type].subTitle,
  icon: <TransactionTypeIcon transactionType={type} withVerticalMargin />,
})

const CandidateCreatePageContent = () => {
  const router = useRouter()
  const addresses = useDaoStore((state) => state.addresses)
  const chain = useChainStore((state) => state.chain)
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()

  const {
    transactionType,
    setTransactionType,
    resetTransactionType,
    startCandidateDraft,
    addTransaction,
    addTransactions,
    removeTransaction,
    removeAllTransactions,
    title,
    summary,
    discussionUrl,
    candidateId,
    candidateNumber,
    salt,
    versionNumber,
    transactions,
    clearCandidate,
    setCandidateId,
    setCandidateNumber,
    setSalt,
    setVersionNumber,
  } = useCandidateStore(
    useShallow((state) => ({
      transactionType: state.transactionType,
      setTransactionType: state.setTransactionType,
      resetTransactionType: state.resetTransactionType,
      startCandidateDraft: state.startCandidateDraft,
      addTransaction: state.addTransaction,
      addTransactions: state.addTransactions,
      removeTransaction: state.removeTransaction,
      removeAllTransactions: state.removeAllTransactions,
      title: state.title,
      summary: state.summary,
      discussionUrl: state.discussionUrl,
      candidateId: state.candidateId,
      candidateNumber: state.candidateNumber,
      salt: state.salt,
      versionNumber: state.versionNumber,
      transactions: state.transactions,
      clearCandidate: state.clearCandidate,
      setCandidateId: state.setCandidateId,
      setCandidateNumber: state.setCandidateNumber,
      setSalt: state.setSalt,
      setVersionNumber: state.setVersionNumber,
    }))
  )

  const isEditingCandidate =
    router.query.edit === '1' ||
    router.query.edit === 'true' ||
    router.query.edit === 'edit'

  const expectedCandidateId = useMemo(() => {
    if (!address || !addresses.token || !salt) return undefined

    return getCandidateId({
      tokenAddress: addresses.token as `0x${string}`,
      proposer: address as `0x${string}`,
      salt: salt as `0x${string}`,
    })
  }, [address, addresses.token, salt])

  const isCandidateIdMismatch = useMemo(() => {
    if (!isEditingCandidate || !candidateId || !expectedCandidateId) return false
    return candidateId.toLowerCase() !== expectedCandidateId.toLowerCase()
  }, [candidateId, expectedCandidateId, isEditingCandidate])

  const [showCreatorMismatchModal, setShowCreatorMismatchModal] = useState(false)

  React.useEffect(() => {
    setShowCreatorMismatchModal(isCandidateIdMismatch)
  }, [isCandidateIdMismatch])

  const getInitialStage = (): CreateStage => {
    if (isEditingCandidate) return 'draft'

    return router.query.stage === 'review'
      ? 'review'
      : router.query.stage === 'transactions' ||
          transactionType ||
          transactions.length > 0
        ? 'transactions'
        : 'draft'
  }

  const [createStage, setCreateStage] = useState<CreateStage>(getInitialStage())
  const [furthestStage, setFurthestStage] = useState<CreateStage>(getInitialStage())
  const [showCreateNewCandidateModal, setShowCreateNewCandidateModal] = useState(false)
  const scrollDirection = useScrollDirection()

  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: addresses.auction,
    functionName: 'paused',
    chainId: chain.id,
  })

  const { shouldFix: shouldFixRendererBase } = useRendererBaseFix({
    chainId: chain.id,
    addresses,
  })

  const isL1Chain = useMemo(() => L1_CHAINS.some((id) => id === chain.id), [chain.id])

  const isAllowedMigrationDao = useMemo(() => {
    const daoTokenAddress = addresses.token
    if (!daoTokenAddress) return false

    return !!ALLOWED_MIGRATION_DAOS.find((address) =>
      isAddressEqual(address, daoTokenAddress)
    )
  }, [addresses.token])

  const isEASSupported = useMemo(() => isChainIdSupportedByEAS(chain.id), [chain.id])
  const isSablierSupported = useMemo(
    () => isChainIdSupportedBySablier(chain.id),
    [chain.id]
  )
  const isDroposalSupported = useMemo(
    () => isChainIdSupportedByDroposal(chain.id),
    [chain.id]
  )
  const isCoinSupported = useMemo(() => isChainIdSupportedByCoining(chain.id), [chain.id])

  const { data: clankerTokens } = useClankerTokens({
    chainId: chain.id,
    collectionAddress: addresses.token,
    enabled: isCoinSupported,
    first: 1,
  })

  const hasClankerToken = useMemo(
    () => isCoinSupported && clankerTokens && clankerTokens.length > 0,
    [isCoinSupported, clankerTokens]
  )

  const transactionFormOptions = useMemo(
    () =>
      TRANSACTION_FORM_OPTIONS.filter((type) => {
        if (
          type === TransactionType.MIGRATION &&
          (!isL1Chain || !isAllowedMigrationDao)
        ) {
          return false
        }
        if (type === TransactionType.PAUSE_AUCTIONS && paused) return false
        if (type === TransactionType.RESUME_AUCTIONS && !paused) return false
        if (type === TransactionType.FIX_RENDERER_BASE && !shouldFixRendererBase)
          return false
        if (type === TransactionType.NOMINATE_DELEGATE && !isEASSupported) return false
        if (type === TransactionType.PIN_TREASURY_ASSET && !isEASSupported) return false
        if (type === TransactionType.STREAM_TOKENS && !isSablierSupported) return false
        if (type === TransactionType.DROPOSAL && !isDroposalSupported) return false
        if (
          type === TransactionType.CREATOR_COIN &&
          (!isCoinSupported || hasClankerToken)
        ) {
          return false
        }
        if (
          type === TransactionType.CONTENT_COIN &&
          (!isCoinSupported || !hasClankerToken)
        ) {
          return false
        }
        return true
      }),
    [
      isL1Chain,
      isAllowedMigrationDao,
      paused,
      shouldFixRendererBase,
      isEASSupported,
      isSablierSupported,
      isDroposalSupported,
      isCoinSupported,
      hasClankerToken,
    ]
  )

  const transactionTypeOptions = useMemo(
    () => transactionFormOptions.map(createSelectOption),
    [transactionFormOptions]
  )

  React.useEffect(() => {
    if (transactionType && !transactionFormOptions.includes(transactionType as any)) {
      resetTransactionType()
    }
  }, [transactionType, transactionFormOptions, resetTransactionType])

  const transactionComposer = useMemo(
    () => ({
      transactionType,
      setTransactionType,
      resetTransactionType,
      transactions,
      addTransaction,
      addTransactions,
      removeTransaction,
      removeAllTransactions,
    }),
    [
      transactionType,
      setTransactionType,
      resetTransactionType,
      transactions,
      addTransaction,
      addTransactions,
      removeTransaction,
      removeAllTransactions,
    ]
  )

  // Update stage from URL query param
  React.useEffect(() => {
    const stage = router.query.stage as CreateStage | undefined
    if (stage && ['draft', 'transactions', 'review'].includes(stage)) {
      setCreateStage(stage)
    }
  }, [router.query.stage])

  React.useEffect(() => {
    if (transactionType) {
      setCreateStage('transactions')
      setFurthestStage((current) => (current === 'draft' ? 'transactions' : current))
    }
  }, [transactionType])

  React.useEffect(() => {
    if (isEditingCandidate) {
      setCreateStage('draft')
      setFurthestStage('draft')
    }
  }, [isEditingCandidate])

  // Update URL when stage changes
  const updateStage = (stage: CreateStage) => {
    setCreateStage(stage)
    if (shouldUpdateFurthestStage(stage)) {
      setFurthestStage(stage)
    }
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, stage },
      },
      undefined,
      { shallow: true }
    )
  }

  const shouldUpdateFurthestStage = (stage: CreateStage): boolean => {
    const stageOrder: CreateStage[] = ['draft', 'transactions', 'review']
    const currentIndex = stageOrder.indexOf(furthestStage)
    const newIndex = stageOrder.indexOf(stage)
    return newIndex > currentIndex
  }

  const handleDraftNext = () => {
    updateStage('transactions')
  }

  const handleTransactionsNext = () => {
    updateStage('review')
  }

  const handleReviewBack = () => {
    updateStage('transactions')
  }

  const handleSubmitSuccess = async (candidateId: string, _attestationUID: string) => {
    const { network, token } = router.query

    if (typeof network !== 'string' || typeof token !== 'string') {
      return
    }

    try {
      const candidate = await getCandidateGroup(chain.id, candidateId, token)

      if (candidate?.candidateNumber != null) {
        await router.push({
          pathname: '/dao/[network]/[token]/candidate/[candidateId]',
          query: {
            network,
            token,
            candidateId: candidate.candidateNumber.toString(),
          },
        })

        return
      }
    } catch {
      // Fall back to the attestation id if the lookup is not ready yet.
    }

    await router.push({
      pathname: '/dao/[network]/[token]/candidate/[candidateId]',
      query: {
        network,
        token,
        candidateId,
      },
    })
  }

  const openDAOPage = async () => {
    const { network, token } = router.query
    await router.push({
      pathname: '/dao/[network]/[token]',
      query: {
        network,
        token,
      },
    })
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to clear this candidate draft?')) {
      clearCandidate()
      updateStage('draft')
      setFurthestStage('draft')
    }
  }

  const canProceedFromDraft = Boolean(title && summary)
  const canProceedFromTransactions = transactions.length > 0
  const isUpdateCandidate =
    isEditingCandidate && !!candidateId && !!salt && !!versionNumber && versionNumber > 1
  const queueStickyTopOffset = scrollDirection === 'down' ? 120 : 200
  const canEnterStage = {
    draft: createStage !== 'draft',
    transactions: createStage !== 'transactions' && canProceedFromDraft,
    review: canProceedFromDraft && canProceedFromTransactions,
  }

  const handleCreateAsNewCandidate = () => {
    startCandidateDraft({
      title,
      summary,
      discussionUrl,
      transactions,
    })
    setShowCreatorMismatchModal(false)
  }

  const handleCreateNewCandidate = React.useCallback(() => {
    setCandidateId(undefined)
    setCandidateNumber(undefined)
    setSalt(undefined)
    setVersionNumber(undefined)
    setShowCreateNewCandidateModal(false)

    const nextQuery = { ...router.query }
    delete nextQuery.edit
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
    })
  }, [router, setCandidateId, setCandidateNumber, setSalt, setVersionNumber])

  return (
    <TransactionComposerProvider value={transactionComposer}>
      <Box
        pb={{ '@initial': 'x30', '@768': 'x12' }}
        w={'100%'}
        px={'x3'}
        style={{ maxWidth: 1060 }}
        mx="auto"
      >
        <CreateProposalHeading
          title={
            createStage === 'draft'
              ? 'Write Candidate'
              : createStage === 'transactions'
                ? 'Add Transactions'
                : 'Review Candidate'
          }
          handleBack={() => {
            void openDAOPage()
          }}
          showHelpLinks
          showQueue={createStage === 'transactions'}
          showContinue={createStage !== 'review'}
          showStepBack
          onStepBack={() => {
            if (createStage === 'review') {
              handleReviewBack()
              return
            }

            if (createStage === 'transactions') {
              updateStage('draft')
            }
          }}
          backDisabled={createStage === 'draft'}
          showReset
          onReset={handleReset}
          resetLabel={'Reset candidate'}
          continueDisabled={
            createStage === 'draft'
              ? !canProceedFromDraft
              : createStage === 'transactions'
                ? !canProceedFromTransactions
                : true
          }
          onContinue={() => {
            if (createStage === 'draft') {
              handleDraftNext()
              return
            }

            if (createStage === 'transactions') {
              handleTransactionsNext()
            }
          }}
          continueLabel={createStage === 'draft' ? 'Continue' : 'Next: Review'}
          hideActionsOnMobile
        />

        {isEditingCandidate && candidateNumber && (
          <CandidateUpdatingBanner
            candidateNumber={candidateNumber}
            versionNumber={versionNumber}
            onCreateNew={() => setShowCreateNewCandidateModal(true)}
          />
        )}

        <ResetConfirmationModal
          open={showCreateNewCandidateModal}
          onCancel={() => setShowCreateNewCandidateModal(false)}
          onConfirm={handleCreateNewCandidate}
          title="Create a new candidate?"
          description="This will stop editing the existing candidate. Your title, summary, discussion link, and queued transactions will stay in the draft."
          confirmLabel="Create new candidate"
        />

        <ProposalStageIndicator
          currentStage={createStage}
          onStageSelect={updateStage}
          isStageClickable={(stage) => canEnterStage[stage]}
        />

        <TwoColumnLayout
          stickyRightColumn
          stickyRightColumnTopOffset={queueStickyTopOffset}
          hideRightColumnOnMobile
          leftColumn={
            <Box>
              {createStage === 'draft' && (
                <Stack gap="x6">
                  <CandidateDraftForm onNext={handleDraftNext} />
                </Stack>
              )}

              {createStage === 'transactions' && (
                <Stack gap="x6">
                  <TransactionStageColumn
                    transactionType={transactionType}
                    options={transactionTypeOptions}
                    onSelectTransactionType={(value: TransactionType) =>
                      setTransactionType(value)
                    }
                    onResetTransactionType={resetTransactionType}
                    form={<TransactionForm />}
                  />
                </Stack>
              )}

              {createStage === 'review' && (
                <Stack gap="x6">
                  <CandidateSubmitForm
                    isUpdate={isUpdateCandidate}
                    onSuccess={handleSubmitSuccess}
                    onBack={handleReviewBack}
                  />
                </Stack>
              )}
            </Box>
          }
          rightColumn={
            createStage === 'transactions' ? (
              transactions?.length > 0 && !transactionType ? (
                <Queue embedded />
              ) : (
                <div />
              )
            ) : null
          }
        />

        {createStage !== 'review' && (
          <MobileProposalActionBar
            showBack
            onBack={() => {
              if (createStage === 'transactions') {
                updateStage('draft')
              }
            }}
            backDisabled={createStage === 'draft'}
            showQueue={createStage === 'transactions'}
            queueCount={transactions.length}
            showReset
            onReset={handleReset}
            onContinue={() => {
              if (createStage === 'draft') {
                handleDraftNext()
                return
              }

              if (createStage === 'transactions') {
                handleTransactionsNext()
              }
            }}
            continueDisabled={
              createStage === 'draft'
                ? !canProceedFromDraft
                : createStage === 'transactions'
                  ? !canProceedFromTransactions
                  : true
            }
            continueLabel={
              createStage === 'draft'
                ? 'Next: Add Transactions'
                : createStage === 'transactions'
                  ? 'Next: Review'
                  : 'Review Candidate'
            }
            showContinue
          />
        )}
      </Box>

      <AnimatedModal open={showCreatorMismatchModal} close={() => {}}>
        <Box p={{ '@initial': 'x4', '@768': 'x6' }}>
          <Stack gap="x4">
            <Text fontSize={20} fontWeight="display">
              Candidate draft belongs to another wallet
            </Text>
            <Text color="text3">
              This draft was created with a different proposer or salt. You can switch
              wallets to continue editing that candidate, or create a new candidate from
              the same metadata.
            </Text>
            <Flex gap="x3" wrap>
              <Button onClick={() => openConnectModal?.()}>
                Connect / switch wallet
              </Button>
              <Button variant="secondary" onClick={handleCreateAsNewCandidate}>
                Create as new candidate
              </Button>
            </Flex>
          </Stack>
        </Box>
      </AnimatedModal>
    </TransactionComposerProvider>
  )
}

const CandidateCreatePage: NextPageWithLayout = () => {
  const { address } = useAccount()
  const { addresses } = useDaoStore()
  const { openConnectModal } = useConnectModal()

  if (!address || !addresses.token) {
    return (
      <Flex direction="column" align="flex-start" gap="x4" p="x6">
        <Text fontSize={20} fontWeight="display">
          Candidate creation is restricted
        </Text>
        <Text color="text3">
          You need to connect a wallet before you can create or edit a candidate.
        </Text>
        <Button onClick={() => openConnectModal?.()}>Connect Wallet</Button>
      </Flex>
    )
  }

  return <CandidateCreatePageContent />
}

CandidateCreatePage.getLayout = (page) => getDaoLayout(page, { hideFooterOnMobile: true })

export const getServerSideProps: GetServerSideProps = async (context) => {
  const network = context.params?.network as string
  const token = context.params?.token as AddressType

  // Validate network
  const validChain = PUBLIC_DEFAULT_CHAINS.find(
    (chain) => chain.slug === network || String(chain.id) === network
  )

  if (!validChain) {
    return { notFound: true }
  }

  const addresses = await getDAOAddresses(validChain.id, token)

  if (!addresses) {
    return { notFound: true }
  }

  // Set cache headers
  context.res.setHeader(
    'Cache-Control',
    `public, s-maxage=${CACHE_TIMES.DAO_FEED}, stale-while-revalidate`
  )

  return {
    props: {
      addresses,
      network: validChain.slug,
      chainId: validChain.id,
      token: token.toLowerCase(),
    },
  }
}

export default CandidateCreatePage

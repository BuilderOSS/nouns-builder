import { ALLOWED_MIGRATION_DAOS } from '@buildeross/constants/addresses'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { L1_CHAINS, PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  CreateProposalHeading,
  MobileProposalActionBar,
  PROPOSAL_SUMMARY_REQUIRED_ERROR,
  PROPOSAL_TITLE_FORMAT_ERROR,
  PROPOSAL_TITLE_MAX_ERROR,
  PROPOSAL_TITLE_MAX_LENGTH,
  PROPOSAL_TITLE_REGEX,
  PROPOSAL_TITLE_REQUIRED_ERROR,
  ProposalDraftForm,
  ProposalStageIndicator,
  Queue,
  TRANSACTION_FORM_OPTIONS,
  TransactionForm,
  TransactionTypeIcon,
  TwoColumnLayout,
} from '@buildeross/create-proposal-ui'
import { useClankerTokens } from '@buildeross/hooks/useClankerTokens'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useRendererBaseFix } from '@buildeross/hooks/useRendererBaseFix'
import { useScrollDirection } from '@buildeross/hooks/useScrollDirection'
import { useVotes } from '@buildeross/hooks/useVotes'
import { TRANSACTION_TYPES, TransactionType } from '@buildeross/proposal-ui'
import { auctionAbi, getDAOAddresses } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { DropdownSelect } from '@buildeross/ui/DropdownSelect'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import { isChainIdSupportedByDroposal } from '@buildeross/utils/droposal'
import { isChainIdSupportedByEAS } from '@buildeross/utils/eas'
import { isChainIdSupportedBySablier } from '@buildeross/utils/sablier/constants'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo } from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { notFoundWrap } from 'src/styles/404.css'
import * as styles from 'src/styles/create.css'
import { isAddressEqual } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

const createSelectOption = (type: TransactionType) => ({
  value: type,
  label: TRANSACTION_TYPES[type].title,
  description: TRANSACTION_TYPES[type].subTitle,
  icon: <TransactionTypeIcon transactionType={type} />,
})

const normalizeTitle = (value?: string | null) => (value || '').trim()
const normalizeSummary = (value?: string | null) => (value || '').trim()

const validateTitle = (value?: string | null): string | undefined => {
  const normalizedTitle = normalizeTitle(value)

  if (!normalizedTitle) {
    return PROPOSAL_TITLE_REQUIRED_ERROR
  }

  if (!PROPOSAL_TITLE_REGEX.test(normalizedTitle)) {
    return PROPOSAL_TITLE_FORMAT_ERROR
  }

  if (normalizedTitle.length > PROPOSAL_TITLE_MAX_LENGTH) {
    return PROPOSAL_TITLE_MAX_ERROR
  }

  return undefined
}

const validateSummary = (value?: string | null): string | undefined => {
  const normalizedSummary = normalizeSummary(value)

  if (!normalizedSummary) {
    return PROPOSAL_SUMMARY_REQUIRED_ERROR
  }

  return undefined
}

const CreateProposalPage: NextPageWithLayout = () => {
  const { query, push } = useRouter()
  const addresses = useDaoStore((x) => x.addresses)
  const { auction, token } = addresses
  const chain = useChainStore((x) => x.chain)
  const transactionType = useProposalStore((x) => x.transactionType)
  const setTransactionType = useProposalStore((x) => x.setTransactionType)
  const resetTransactionType = useProposalStore((x) => x.resetTransactionType)
  const transactions = useProposalStore((x) => x.transactions)
  const title = useProposalStore((x) => x.title)
  const summary = useProposalStore((x) => x.summary)
  const setTitle = useProposalStore((x) => x.setTitle)
  const setSummary = useProposalStore((x) => x.setSummary)
  const clearProposal = useProposalStore((x) => x.clearProposal)

  const initialStageFromQuery = query?.stage === 'transactions' ? 'transactions' : 'draft'
  const [createStage, setCreateStage] = React.useState<'draft' | 'transactions'>(() =>
    initialStageFromQuery === 'transactions' || transactionType || transactions.length > 0
      ? 'transactions'
      : 'draft'
  )
  const [furthestStage, setFurthestStage] = React.useState<'draft' | 'transactions'>(
    initialStageFromQuery === 'transactions' || transactionType || transactions.length > 0
      ? 'transactions'
      : 'draft'
  )
  const [titleTouched, setTitleTouched] = React.useState(false)
  const [summaryTouched, setSummaryTouched] = React.useState(false)

  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: auction,
    functionName: 'paused',
    chainId: chain.id,
  })

  const { shouldFix: shouldFixRendererBase } = useRendererBaseFix({
    chainId: chain.id,
    addresses,
  })

  const { address } = useAccount()
  const scrollDirection = useScrollDirection()

  const { isLoading, hasThreshold } = useVotes({
    chainId: chain.id,
    governorAddress: addresses.governor,
    signerAddress: address,
    collectionAddress: query?.token as AddressType,
  })

  const { isGovernanceDelayed } = useDelayedGovernance({
    chainId: chain.id,
    tokenAddress: addresses.token,
    governorAddress: addresses.governor,
  })

  const isL1Chain = useMemo(() => L1_CHAINS.some((id) => id === chain.id), [chain.id])

  const isAllowedMigrationDao = useMemo(
    () =>
      token ? !!ALLOWED_MIGRATION_DAOS.find((x) => isAddressEqual(x, token)) : false,
    [token]
  )

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

  // Fetch clanker tokens to check if DAO has any
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

  const TRANSACTION_FORM_OPTIONS_FILTERED = useMemo(
    () =>
      TRANSACTION_FORM_OPTIONS.filter((x) => {
        if (x === TransactionType.MIGRATION && (!isL1Chain || !isAllowedMigrationDao))
          return false
        if (x === TransactionType.PAUSE_AUCTIONS && paused) return false
        if (x === TransactionType.RESUME_AUCTIONS && !paused) return false
        if (x === TransactionType.FIX_RENDERER_BASE && !shouldFixRendererBase)
          return false
        if (x === TransactionType.NOMINATE_DELEGATE && !isEASSupported) return false
        if (x === TransactionType.PIN_TREASURY_ASSET && !isEASSupported) return false
        if (x === TransactionType.STREAM_TOKENS && !isSablierSupported) return false
        if (x === TransactionType.DROPOSAL && !isDroposalSupported) return false
        if (x === TransactionType.CREATOR_COIN && (!isCoinSupported || hasClankerToken))
          return false
        if (x === TransactionType.CONTENT_COIN && (!isCoinSupported || !hasClankerToken))
          return false
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

  useEffect(() => {
    if (
      transactionType &&
      !TRANSACTION_FORM_OPTIONS_FILTERED.includes(transactionType as any)
    ) {
      resetTransactionType()
    }
  }, [transactionType, TRANSACTION_FORM_OPTIONS_FILTERED, resetTransactionType])

  const options = useMemo(() => {
    return TRANSACTION_FORM_OPTIONS_FILTERED.map(createSelectOption)
  }, [TRANSACTION_FORM_OPTIONS_FILTERED])

  const missingDraftRequirements = useMemo(() => {
    const requirements: string[] = []

    const titleValidationError = validateTitle(title)
    if (titleValidationError === PROPOSAL_TITLE_REQUIRED_ERROR) {
      requirements.push('add a proposal title')
    } else if (titleValidationError === PROPOSAL_TITLE_FORMAT_ERROR) {
      requirements.push('fix the proposal title format')
    } else if (titleValidationError === PROPOSAL_TITLE_MAX_ERROR) {
      requirements.push('shorten the proposal title')
    }

    if (validateSummary(summary)) {
      requirements.push('add a proposal summary')
    }

    return requirements
  }, [title, summary])

  const titleError = useMemo(() => {
    if (!titleTouched) return undefined
    return validateTitle(title)
  }, [title, titleTouched])

  const summaryError = useMemo(() => {
    if (!summaryTouched) return undefined
    return validateSummary(summary)
  }, [summary, summaryTouched])

  const missingReviewRequirements = useMemo(() => {
    const requirements = [...missingDraftRequirements]

    if (!transactions.length) {
      requirements.push('queue at least one transaction')
    }

    return requirements
  }, [missingDraftRequirements, transactions.length])

  const canStartTransactions = missingDraftRequirements.length === 0
  const canContinueToReview = missingReviewRequirements.length === 0

  const canEnterStage = useMemo(
    () => ({
      draft: true,
      transactions: canStartTransactions,
      review: canContinueToReview,
    }),
    [canStartTransactions, canContinueToReview]
  )

  const canContinueFromCurrentStage =
    createStage === 'draft' ? canEnterStage.transactions : canEnterStage.review

  const hasDraftBlockers = missingDraftRequirements.length > 0
  const hasTitleDraftBlocker = !!validateTitle(title)

  const joinRequirements = (requirements: string[]) => {
    if (requirements.length === 1) return requirements[0]
    if (requirements.length === 2) return `${requirements[0]} and ${requirements[1]}`
    return `${requirements.slice(0, -1).join(', ')}, and ${requirements.at(-1)}`
  }

  const continueHelperText = useMemo(() => {
    if (createStage === 'draft') {
      if (!missingDraftRequirements.length) return null
      return `To continue, ${joinRequirements(missingDraftRequirements)}.`
    }

    if (!missingReviewRequirements.length) return null

    if (hasDraftBlockers) {
      return `To continue, fix proposal metadata (${joinRequirements(missingDraftRequirements)}) and queue at least one transaction if needed.`
    }

    return `To continue, ${joinRequirements(missingReviewRequirements)}.`
  }, [createStage, hasDraftBlockers, missingDraftRequirements, missingReviewRequirements])

  // Keep the right queue column below both sticky top nav and sticky create header row.
  // - nav visible: 80px nav + ~96px heading row
  // - nav hidden: ~96px heading row
  const queueStickyTopOffset = scrollDirection === 'down' ? 120 : 200

  React.useEffect(() => {
    if (transactionType) {
      setCreateStage('transactions')
      setFurthestStage('transactions')
    }
  }, [transactionType])

  React.useEffect(() => {
    if (query?.stage === 'transactions' && furthestStage === 'transactions') {
      setCreateStage('transactions')
      return
    }

    if (query?.stage === 'draft') {
      setCreateStage('draft')
    }
  }, [query?.stage, furthestStage])

  const openDaoActivityPage = useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]`,
      query: {
        network: chain.slug,
        token: addresses.token,
        tab: 'activity',
      },
    })
  }, [push, chain.slug, addresses.token])

  const openDaoAdminPage = useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]`,
      query: {
        network: chain.slug,
        token: addresses.token,
        tab: 'admin',
      },
    })
  }, [push, chain.slug, addresses.token])

  const openProposalReviewPage = useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]/proposal/review`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [push, chain.slug, addresses.token])

  const onContinueStep = useCallback(async () => {
    if (createStage === 'draft') {
      if (!canEnterStage.transactions) return
      setCreateStage('transactions')
      setFurthestStage('transactions')
      return
    }

    if (!canEnterStage.review) return
    await openProposalReviewPage()
  }, [createStage, canEnterStage, openProposalReviewPage])

  const onBackStep = useCallback(() => {
    if (createStage === 'transactions') {
      setCreateStage('draft')
    }
  }, [createStage])

  const onResetProposal = useCallback(() => {
    clearProposal()
    setTitleTouched(false)
    setSummaryTouched(false)
    setCreateStage('draft')
    setFurthestStage('draft')
  }, [clearProposal])

  const onStageSelect = useCallback(
    (stage: 'draft' | 'transactions' | 'review') => {
      if (stage === 'draft') {
        setCreateStage('draft')
        return
      }

      if (stage === 'transactions') {
        if (!canEnterStage.transactions) return
        setCreateStage('transactions')
        setFurthestStage('transactions')
        return
      }

      if (createStage !== 'transactions') return
      if (!canEnterStage.review) return
      void openProposalReviewPage()
    },
    [canEnterStage, createStage, openProposalReviewPage]
  )

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
      mb={'x8'}
      pb={{ '@initial': 'x30', '@768': 'x0' }}
      w={'100%'}
      px={'x3'}
      style={{ maxWidth: 1060 }}
      mx="auto"
    >
      <CreateProposalHeading
        title={createStage === 'draft' ? 'Write Proposal' : 'Add Transactions'}
        handleBack={openDaoActivityPage}
        showHelpLinks
        showQueue={
          createStage === 'transactions' &&
          (!!transactionType || (!transactionType && transactions.length > 0))
        }
        showContinue
        showStepBack
        onStepBack={onBackStep}
        backDisabled={createStage === 'draft'}
        showReset
        onReset={onResetProposal}
        continueDisabled={!canContinueFromCurrentStage}
        onContinue={onContinueStep}
        hideActionsOnMobile
        queueButtonClassName={!transactionType ? styles.showOnMobile : undefined}
      />

      <ProposalStageIndicator
        currentStage={createStage === 'draft' ? 'draft' : 'transactions'}
        showOnboardingCallout
        onStageSelect={onStageSelect}
        isStageClickable={(stage) => {
          if (stage === 'draft') return createStage !== 'draft'
          if (stage === 'transactions') {
            return createStage !== 'transactions' && canEnterStage.transactions
          }
          if (stage === 'review') {
            return createStage === 'transactions' && canEnterStage.review
          }
          return false
        }}
      />

      {continueHelperText && (
        <Flex align={'center'} gap={'x2'} mb={'x4'}>
          <Text variant={'paragraph-sm'} color={'text3'}>
            {continueHelperText}
          </Text>
          {createStage === 'transactions' && hasDraftBlockers && (
            <Button
              variant={'ghost'}
              size={'sm'}
              onClick={() => setCreateStage('draft')}
              style={{
                minHeight: 'auto',
                height: 'auto',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              <Text variant={'paragraph-sm'} color={'text3'}>
                {hasTitleDraftBlocker
                  ? 'Fix title in Write Proposal'
                  : 'Go to Write Proposal'}
              </Text>
            </Button>
          )}
        </Flex>
      )}

      {createStage === 'draft' ? (
        <Stack
          w={'100%'}
          p={'x4'}
          mb={'x8'}
          borderColor={'border'}
          borderStyle={'solid'}
          borderWidth={'normal'}
          borderRadius={'curved'}
          gap={'x2'}
        >
          <ProposalDraftForm
            title={title || ''}
            summary={summary || ''}
            onTitleChange={setTitle}
            onSummaryChange={setSummary}
            onTitleBlur={() => setTitleTouched(true)}
            onSummaryBlur={() => setSummaryTouched(true)}
            titleError={titleError}
            summaryError={summaryError}
          />
        </Stack>
      ) : (
        <TwoColumnLayout
          leftColumn={
            <Stack gap={'x0'}>
              <Stack>
                <Text variant={'heading-xs'} mb={'x5'}>
                  Select Transaction Type
                </Text>
                {transactionType ? (
                  <Flex gap={'x2'} align={'flex-start'}>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <DropdownSelect
                        value={transactionType}
                        options={options}
                        customLabel={TRANSACTION_TYPES[transactionType].title}
                        onChange={(value: TransactionType) => setTransactionType(value)}
                      />
                    </Box>
                    <Button
                      variant="secondary"
                      h={'x19'}
                      minH={'x19'}
                      px={'x4'}
                      aria-label={'Cancel editing transaction'}
                      onClick={resetTransactionType}
                    >
                      <Icon id={'cross'} />
                    </Button>
                  </Flex>
                ) : (
                  <DropdownSelect
                    value={undefined}
                    options={options}
                    customLabel={'Select transaction type'}
                    onChange={(value: TransactionType) => setTransactionType(value)}
                  />
                )}
              </Stack>

              <Flex
                borderWidth={'thin'}
                borderStyle={'solid'}
                borderColor={'ghostHover'}
                mt={'x2'}
                mb={'x8'}
              />

              {!transactionType && (
                <Stack gap={'x2'}>
                  <Flex
                    w={'100%'}
                    justify={'flex-start'}
                    p={'x6'}
                    borderWidth={'normal'}
                    borderStyle={'solid'}
                    borderColor={'ghostHover'}
                    style={{ borderRadius: 12 }}
                    gap={'x2'}
                    cursor={'pointer'}
                    onClick={() => void openDaoAdminPage()}
                  >
                    <Stack>
                      <Text variant="label-lg" mb={'x1'}>
                        Configure DAO Settings
                      </Text>
                      <Text variant="paragraph-md" color={'text3'}>
                        Change all the main DAO settings in the Admin Tab
                      </Text>
                    </Stack>
                    <Icon
                      id={'external-16'}
                      fill={'text4'}
                      size={'sm'}
                      alignSelf={'center'}
                      ml={'auto'}
                    />
                  </Flex>
                </Stack>
              )}

              {transactionType && <TransactionForm />}
            </Stack>
          }
          rightColumn={
            transactions.length > 0 && !transactionType ? (
              <Box
                className={styles.hideOnMobile}
                position={'sticky'}
                style={{
                  top: `${queueStickyTopOffset}px`,
                  transition: 'top 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Queue embedded />
              </Box>
            ) : undefined
          }
        />
      )}

      <MobileProposalActionBar
        showBack
        onBack={onBackStep}
        backDisabled={createStage === 'draft'}
        showQueue={createStage === 'transactions'}
        showReset
        onReset={onResetProposal}
        showContinue
        onContinue={() => {
          void onContinueStep()
        }}
        continueDisabled={!canContinueFromCurrentStage}
        continueLabel={'Continue'}
      />
    </Stack>
  )
}

CreateProposalPage.getLayout = (page) => getDaoLayout(page, { hideFooterOnMobile: true })

export default CreateProposalPage

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

  if (!addresses)
    return {
      notFound: true,
    }

  return {
    props: {
      addresses,
      chainId: chain.id,
    },
  }
}

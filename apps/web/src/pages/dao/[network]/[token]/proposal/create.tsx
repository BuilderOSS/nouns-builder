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

    const normalizedTitle = title?.trim() || ''
    const normalizedSummary = summary?.trim() || ''

    if (!normalizedTitle) {
      requirements.push('add a proposal title')
    } else if (!PROPOSAL_TITLE_REGEX.test(normalizedTitle)) {
      requirements.push('fix the proposal title format')
    } else if (normalizedTitle.length > PROPOSAL_TITLE_MAX_LENGTH) {
      requirements.push('shorten the proposal title')
    }

    if (!normalizedSummary) {
      requirements.push('add a proposal summary')
    }

    return requirements
  }, [title, summary])

  const titleError = useMemo(() => {
    const normalizedTitle = title?.trim() || ''

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
  }, [title])

  const summaryError = useMemo(() => {
    const normalizedSummary = summary?.trim() || ''
    if (!normalizedSummary) {
      return PROPOSAL_SUMMARY_REQUIRED_ERROR
    }
    return undefined
  }, [summary])

  const missingReviewRequirements = useMemo(() => {
    const requirements = [...missingDraftRequirements]

    if (!transactions.length) {
      requirements.push('queue at least one transaction')
    }

    return requirements
  }, [missingDraftRequirements, transactions.length])

  const canStartTransactions = missingDraftRequirements.length === 0
  const canContinueToReview = missingReviewRequirements.length === 0
  const isMissingTitle = !title?.trim()
  const isMissingDescription = !summary?.trim()
  const isMissingTransactions = transactions.length === 0

  const joinRequirements = (requirements: string[]) => {
    if (requirements.length === 1) return requirements[0]
    if (requirements.length === 2) return `${requirements[0]} and ${requirements[1]}`
    return `${requirements.slice(0, -1).join(', ')}, and ${requirements.at(-1)}`
  }

  const continueHelperText = useMemo(() => {
    const requiredMissing: string[] = []

    if (isMissingTitle) requiredMissing.push('a title')
    if (isMissingDescription) requiredMissing.push('a description')
    if (createStage === 'transactions' && isMissingTransactions) {
      requiredMissing.push('at least one transaction')
    }

    if (!requiredMissing.length) return null

    return `To continue, add ${joinRequirements(requiredMissing)}.`
  }, [createStage, isMissingDescription, isMissingTitle, isMissingTransactions])

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
      if (!canStartTransactions) return
      setCreateStage('transactions')
      setFurthestStage('transactions')
      return
    }

    if (!canContinueToReview) return
    await openProposalReviewPage()
  }, [createStage, canStartTransactions, canContinueToReview, openProposalReviewPage])

  const onBackStep = useCallback(() => {
    if (createStage === 'transactions') {
      setCreateStage('draft')
    }
  }, [createStage])

  const onResetProposal = useCallback(() => {
    clearProposal()
    setCreateStage('draft')
    setFurthestStage('draft')
  }, [clearProposal])

  const onStageSelect = useCallback(
    (stage: 'draft' | 'transactions' | 'review') => {
      if (stage === 'review') return
      if (stage === 'transactions' && furthestStage !== 'transactions') return
      setCreateStage(stage)
    },
    [furthestStage]
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
      mt={'x24'}
      mb={'x20'}
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
        continueDisabled={
          createStage === 'draft' ? !canStartTransactions : !canContinueToReview
        }
        onContinue={onContinueStep}
        hideActionsOnMobile
        queueButtonClassName={!transactionType ? styles.showOnMobile : undefined}
      />

      <ProposalStageIndicator
        currentStage={createStage === 'draft' ? 'draft' : 'transactions'}
        showOnboardingCallout
        onStageSelect={onStageSelect}
        isStageClickable={(stage) => {
          if (stage === 'draft') {
            return furthestStage === 'transactions' && createStage !== 'draft'
          }
          if (stage === 'transactions') {
            return furthestStage === 'transactions' && createStage !== 'transactions'
          }
          return false
        }}
      />

      {continueHelperText && (
        <Flex align={'center'} gap={'x2'} mb={'x4'}>
          <Text variant={'paragraph-sm'} color={'text3'}>
            {continueHelperText}
          </Text>
          {createStage === 'transactions' && (isMissingTitle || isMissingDescription) && (
            <Text
              variant={'paragraph-sm'}
              color={'text3'}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setCreateStage('draft')}
            >
              Go to Write Proposal
            </Text>
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
              <Box className={styles.hideOnMobile}>
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
        continueDisabled={
          createStage === 'draft' ? !canStartTransactions : !canContinueToReview
        }
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

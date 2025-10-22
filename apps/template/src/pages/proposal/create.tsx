import { ALLOWED_MIGRATION_DAOS } from '@buildeross/constants/addresses'
import { L1_CHAINS } from '@buildeross/constants/chains'
import {
  CreateProposalHeading,
  SelectTransactionType,
  TRANSACTION_FORM_OPTIONS,
  TransactionForm,
  TransactionFormType,
  TransactionTypeIcon,
  TwoColumnLayout,
} from '@buildeross/create-proposal-ui'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useRendererBaseFix } from '@buildeross/hooks/useRendererBaseFix'
import { useVotes } from '@buildeross/hooks/useVotes'
import { TRANSACTION_TYPES, TransactionType } from '@buildeross/proposal-ui'
import { auctionAbi } from '@buildeross/sdk/contract'
import { isChainIdSupportedByEAS } from '@buildeross/sdk/eas'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { DropdownSelect } from '@buildeross/ui/DropdownSelect'
import { Flex, Stack } from '@buildeross/zord'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { isAddressEqual } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

import { getDaoConfig } from '@/config'

const createSelectOption = (type: TransactionFormType) => ({
  value: type,
  label: TRANSACTION_TYPES[type].title,
  icon: <TransactionTypeIcon transactionType={type} />,
})

const CreateProposalPage: NextPage = () => {
  const { push } = useRouter()
  const addresses = useDaoStore((x) => x.addresses)
  const daoConfig = getDaoConfig()
  const { auction, token } = addresses
  const chain = useChainStore((x) => x.chain)
  const [transactionType, setTransactionType] = useState<
    TransactionFormType | undefined
  >()
  const transactions = useProposalStore((state) => state.transactions)

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

  useEffect(() => {
    if (transactions.length && !transactionType) {
      setTransactionType(transactions[0].type as TransactionFormType)
    }
  }, [transactions, transactionType, setTransactionType])

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

  const isL1Chain = useMemo(() => L1_CHAINS.some((id) => id === chain.id), [chain.id])

  const isAllowedMigrationDao = useMemo(
    () =>
      token ? !!ALLOWED_MIGRATION_DAOS.find((x) => isAddressEqual(x, token)) : false,
    [token]
  )

  const isEASSupported = useMemo(() => isChainIdSupportedByEAS(chain.id), [chain.id])

  const TRANSACTION_FORM_OPTIONS_FILTERED = useMemo(
    () =>
      TRANSACTION_FORM_OPTIONS.filter((x) => {
        if (x === TransactionType.MIGRATION && (!isL1Chain || !isAllowedMigrationDao))
          return false
        if (x === TransactionType.PAUSE_AUCTIONS && paused) return false
        if (x === TransactionType.RESUME_AUCTIONS && !paused) return false
        if (x === TransactionType.FIX_RENDERER_BASE && !shouldFixRendererBase)
          return false
        if (x === TransactionType.ESCROW_DELEGATE && !isEASSupported) return false
        return true
      }),
    [isL1Chain, isAllowedMigrationDao, paused, shouldFixRendererBase, isEASSupported]
  )

  const options = useMemo(() => {
    return TRANSACTION_FORM_OPTIONS_FILTERED.map(createSelectOption)
  }, [TRANSACTION_FORM_OPTIONS_FILTERED])

  const openDaoActivityPage = useCallback(async () => {
    await push('/proposals')
  }, [push])

  const openDaoAdminPage = useCallback(async () => {
    await push('/settings')
  }, [push])

  const openProposalReviewPage = useCallback(async () => {
    await push('/proposal/review')
  }, [push])

  if (isLoading) return null

  if (!address)
    return (
      <>
        <Head>
          <title>{`Create Proposal | ${daoConfig.name}`}</title>
          <meta name="description" content="Create a new DAO proposal" />
          <meta property="og:title" content="Create Proposal | DAO" />
          <meta property="og:description" content="Create a new DAO proposal" />
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
          <title>{`Create Proposal | ${daoConfig.name}`}</title>
          <meta name="description" content="Create a new DAO proposal" />
          <meta property="og:title" content="Create Proposal | DAO" />
          <meta property="og:description" content="Create a new DAO proposal" />
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
        <title>{`Create Proposal | ${daoConfig.name}`}</title>
        <meta name="description" content={`Create a new ${daoConfig.name} proposal`} />
        <meta property="og:title" content={`Create Proposal | ${daoConfig.name}`} />
        <meta
          property="og:description"
          content={`Create a new ${daoConfig.name} proposal`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack w={'100%'} px={'x3'} style={{ maxWidth: 1060 }} mx="auto">
        <CreateProposalHeading
          title={'Create Proposal'}
          handleBack={openDaoActivityPage}
          showDocsLink
          showQueue
          onOpenProposalReview={openProposalReviewPage}
        />
        {transactionType ? (
          <TwoColumnLayout
            leftColumn={
              <Stack gap="x4">
                <DropdownSelect
                  value={transactionType}
                  options={options}
                  onChange={(value) => setTransactionType(value)}
                />
                <TransactionForm type={transactionType} />
              </Stack>
            }
          />
        ) : (
          <TwoColumnLayout
            leftColumn={
              <SelectTransactionType
                transactionTypes={TRANSACTION_FORM_OPTIONS_FILTERED}
                onSelect={setTransactionType}
                onOpenAdminSettings={openDaoAdminPage}
              />
            }
          />
        )}
      </Stack>
    </>
  )
}

export default CreateProposalPage

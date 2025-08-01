import { ALLOWED_MIGRATION_DAOS } from '@buildeross/constants/addresses'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { L1_CHAINS } from '@buildeross/constants/chains'
import { useVotes } from '@buildeross/hooks'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { auctionAbi } from '@buildeross/sdk/contract'
import { getDAOAddresses } from '@buildeross/sdk/contract'
import { isChainIdSupportedByEAS } from '@buildeross/sdk/eas'
import { AddressType } from '@buildeross/types'
import { Flex, Stack } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import {
  CreateProposalHeading,
  DropdownSelect,
  SelectTransactionType,
  TRANSACTION_FORM_OPTIONS,
  TRANSACTION_TYPES,
  TransactionForm,
  TransactionFormType,
  TransactionType,
  TransactionTypeIcon,
  TwoColumnLayout,
  useProposalStore,
} from 'src/modules/create-proposal'
import { useRendererBaseFix } from 'src/modules/create-proposal/hooks'
import { NextPageWithLayout } from 'src/pages/_app'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { notFoundWrap } from 'src/styles/404.css'
import { isAddressEqual } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

const CreateProposalPage: NextPageWithLayout = () => {
  const router = useRouter()
  const addresses = useDaoStore((x) => x.addresses)
  const { auction, token } = addresses
  const chain = useChainStore((x) => x.chain)
  const { query } = router
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
    governorAddress: addresses?.governor,
    signerAddress: address,
    collectionAddress: query?.token as AddressType,
  })

  const { isGovernanceDelayed } = useDelayedGovernance({
    chainId: chain.id,
    tokenAddress: addresses?.token,
    governorAddress: addresses?.governor,
  })

  const createSelectOption = (type: TransactionFormType) => ({
    value: type,
    label: TRANSACTION_TYPES[type].title,
    icon: <TransactionTypeIcon transactionType={type} />,
  })

  const isL1Chain = L1_CHAINS.find((l1ChainIds) => l1ChainIds === chain.id)
  const isAllowedMigrationDao = token
    ? !!ALLOWED_MIGRATION_DAOS.find((x) => isAddressEqual(x, token))
    : false
  const isEASSupported = useMemo(() => isChainIdSupportedByEAS(chain.id), [chain.id])

  const TRANSACTION_FORM_OPTIONS_FILTERED = TRANSACTION_FORM_OPTIONS.filter((x) => {
    if (x === TransactionType.MIGRATION && (!isL1Chain || !isAllowedMigrationDao))
      return false
    if (x === TransactionType.PAUSE_AUCTIONS && paused) return false
    if (x === TransactionType.RESUME_AUCTIONS && !paused) return false
    if (x === TransactionType.FIX_RENDERER_BASE && !shouldFixRendererBase) return false
    if (x === TransactionType.ESCROW_DELEGATE && !isEASSupported) return false
    return true
  })

  const options = TRANSACTION_FORM_OPTIONS_FILTERED.map(createSelectOption)

  const handleDropdownOnChange = (value: TransactionFormType) => {
    setTransactionType(value)
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
    <Stack
      mt={'x24'}
      mb={'x20'}
      w={'100%'}
      px={'x3'}
      style={{ maxWidth: 1060 }}
      mx="auto"
    >
      <CreateProposalHeading
        title={'Create Proposal'}
        transactionType={transactionType}
        showDocsLink
      />
      {transactionType ? (
        <TwoColumnLayout
          leftColumn={
            <Stack>
              <DropdownSelect
                value={transactionType}
                options={options}
                onChange={(value) => handleDropdownOnChange(value)}
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
            />
          }
        />
      )}
    </Stack>
  )
}

CreateProposalPage.getLayout = getDaoLayout

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

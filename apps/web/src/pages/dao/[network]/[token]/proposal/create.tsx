import { ALLOWED_MIGRATION_DAOS } from '@buildeross/constants/addresses'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import {
  type COIN_SUPPORTED_CHAIN_ID,
  COIN_SUPPORTED_CHAIN_IDS,
  L1_CHAINS,
  PUBLIC_DEFAULT_CHAINS,
} from '@buildeross/constants/chains'
import {
  CreateProposalHeading,
  SelectTransactionType,
  TRANSACTION_FORM_OPTIONS,
  TransactionForm,
  TransactionFormType,
  TransactionTypeIcon,
  TwoColumnLayout,
} from '@buildeross/create-proposal-ui'
import { useClankerTokens } from '@buildeross/hooks/useClankerTokens'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useRendererBaseFix } from '@buildeross/hooks/useRendererBaseFix'
import { useVotes } from '@buildeross/hooks/useVotes'
import { TRANSACTION_TYPES, TransactionType } from '@buildeross/proposal-ui'
import { auctionAbi, getDAOAddresses } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { DropdownSelect } from '@buildeross/ui/DropdownSelect'
import { isChainIdSupportedByEAS } from '@buildeross/utils/eas'
import { isSablierSupported as isChainIdSupportedBySablier } from '@buildeross/utils/sablier/constants'
import { Flex, Stack } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { notFoundWrap } from 'src/styles/404.css'
import { isAddressEqual } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

const createSelectOption = (type: TransactionFormType) => ({
  value: type,
  label: TRANSACTION_TYPES[type].title,
  icon: <TransactionTypeIcon transactionType={type} />,
})

const CreateProposalPage: NextPageWithLayout = () => {
  const { query, push } = useRouter()
  const addresses = useDaoStore((x) => x.addresses)
  const { auction, token } = addresses
  const chain = useChainStore((x) => x.chain)
  const [transactionType, setTransactionType] = useState<TransactionFormType | null>(null)

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

  const isCoinSupported = useMemo(
    () => COIN_SUPPORTED_CHAIN_IDS.includes(chain.id as COIN_SUPPORTED_CHAIN_ID),
    [chain.id]
  )

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
      isCoinSupported,
      hasClankerToken,
    ]
  )

  const options = useMemo(() => {
    return TRANSACTION_FORM_OPTIONS_FILTERED.map(createSelectOption)
  }, [TRANSACTION_FORM_OPTIONS_FILTERED])

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
              <TransactionForm
                transactionType={transactionType}
                resetTransactionType={() => setTransactionType(null)}
              />
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

import { BUILDER_COLLECTION_ADDRESS } from '@buildeross/constants/addresses'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  CrossChainMigration,
  CrossChainMigrationProvider,
} from '@buildeross/create-proposal-ui'
import { getDAOAddresses, tokenAbi } from '@buildeross/sdk/contract'
import { daoOGMetadataRequest } from '@buildeross/sdk/subgraph'
import { DaoContractAddresses, useChainStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'
import { useAccount, useReadContracts } from 'wagmi'

import { getDaoLayout } from '../../../../layouts/DaoLayout'
import { NextPageWithLayout } from '../../../_app'

interface MigratePageProps {
  daoName: string
  addresses: DaoContractAddresses
  chainId: CHAIN_ID
}

/**
 * Wallet addresses with special access to the cross-chain migration wizard
 * These addresses can migrate any DAO regardless of founder status or Builder DAO membership
 */
const MIGRATION_ALLOWLIST: AddressType[] = [
  '0x19a8eb80c1483CEAA1278B16C5D5eF0104F85905' as AddressType,
  '0x4E3378b12Af3B5C36235b7d50fe37593E54f7848' as AddressType,
]

const MigratePage: NextPageWithLayout<MigratePageProps> = ({
  daoName,
  addresses,
  chainId,
}) => {
  const { address: walletAddress, isConnected } = useAccount()
  const chain = useChainStore((x) => x.chain)
  const router = useRouter()

  const onNavigateToReview = useCallback(() => {
    router.push({
      pathname: `/dao/[network]/[token]/proposal/review`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [router, chain.slug, addresses.token])

  // Batch both blockchain queries in a single RPC call
  const { data: contractResults } = useReadContracts({
    contracts: [
      // Check if user is a founder of the DAO being migrated
      {
        abi: tokenAbi,
        address: addresses.token,
        functionName: 'getFounders',
        chainId: chainId,
      },
      // Check if user has Builder DAO tokens on Base mainnet
      {
        abi: tokenAbi,
        address: BUILDER_COLLECTION_ADDRESS[CHAIN_ID.BASE],
        functionName: 'balanceOf',
        args: walletAddress ? [walletAddress] : undefined,
        chainId: CHAIN_ID.BASE,
      },
    ],
    query: {
      enabled: !!addresses.token && !!walletAddress,
    },
  })

  const founders = contractResults?.[0]?.result
  const builderBalance = contractResults?.[1]?.result

  // Check if user has migration access
  const hasMigrationAccess = React.useMemo(() => {
    if (!walletAddress) return false

    // Check 1: Is user in the allowlist?
    const isAllowlisted = MIGRATION_ALLOWLIST.some(
      (allowed) => allowed.toLowerCase() === walletAddress.toLowerCase()
    )
    if (isAllowlisted) return true

    // Check 2: Is user a founder of this DAO?
    const isFounder = founders?.some(
      (founder) => founder.wallet.toLowerCase() === walletAddress.toLowerCase()
    )
    if (isFounder) return true

    // Check 3: Does user have Builder DAO tokens?
    const hasBuilderToken = builderBalance && builderBalance > 0n
    if (hasBuilderToken) return true

    return false
  }, [walletAddress, founders, builderBalance])

  // Show access denied message if user doesn't have access
  if (isConnected && !hasMigrationAccess) {
    return (
      <Flex justify="center" align="center" py="x32" px="x4">
        <Stack gap="x6" align="center" style={{ maxWidth: 600 }}>
          <Text fontSize="28" fontWeight="display" textAlign="center">
            Access Restricted
          </Text>
          <Text fontSize="16" color="text3" textAlign="center">
            Cross-chain migration is currently restricted. Please contact the DAO admin
            for access.
          </Text>
        </Stack>
      </Flex>
    )
  }

  // Show connect wallet message if not connected
  if (!isConnected) {
    return (
      <Flex justify="center" align="center" py="x32" px="x4">
        <Stack gap="x6" align="center" style={{ maxWidth: 600 }}>
          <Text fontSize="28" fontWeight="display" textAlign="center">
            Connect Wallet
          </Text>
          <Text fontSize="16" color="text3" textAlign="center">
            Please connect your wallet to access the cross-chain migration feature.
          </Text>
        </Stack>
      </Flex>
    )
  }

  return (
    <Flex justify="center" py="x12" px="x4">
      <Box style={{ maxWidth: 1280, width: '100%' }}>
        <Stack gap="x6">
          {/* Header */}
          <Box>
            <Text fontSize="35" fontWeight="display" mb="x2">
              Cross-Chain Migration
            </Text>
            <Text fontSize="16" color="text3">
              Migrate {daoName} to another blockchain network
            </Text>
          </Box>

          {/* Migration Form */}
          <Box>
            {addresses.token ? (
              <CrossChainMigrationProvider
                chainId={chainId}
                tokenAddress={addresses.token}
                onNavigateToReview={onNavigateToReview}
              >
                <CrossChainMigration />
              </CrossChainMigrationProvider>
            ) : (
              <Text color="negative">DAO token address not found</Text>
            )}
          </Box>
        </Stack>
      </Box>
    </Flex>
  )
}

MigratePage.getLayout = (page) =>
  getDaoLayout(page, { hideFooterOnMobile: true, hideChainMenu: true })

export default MigratePage

export const getServerSideProps: GetServerSideProps<MigratePageProps> = async ({
  res,
  params,
}) => {
  const { maxAge, swr } = CACHE_TIMES.DAO_PROPOSAL
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  const token = params?.token as AddressType
  const network = params?.network as string

  try {
    const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)
    if (!chain) throw new Error('Invalid network')

    // Fetch DAO addresses
    const addresses = await getDAOAddresses(chain.id, token)
    if (!addresses) throw new Error('DAO addresses not found')

    // Fetch DAO metadata
    const dao = await daoOGMetadataRequest(chain.id, token)
    if (!dao) throw new Error('DAO not found')

    const props: MigratePageProps = {
      daoName: dao.name,
      addresses,
      chainId: chain.id,
    }

    return {
      props,
    }
  } catch (e) {
    return {
      notFound: true,
    }
  }
}

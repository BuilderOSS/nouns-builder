import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { isMigrationAllowed } from '@buildeross/constants/migration'
import {
  CrossChainMigration,
  CrossChainMigrationProvider,
} from '@buildeross/create-proposal-ui'
import { getDAOAddresses } from '@buildeross/sdk/contract'
import { daoOGMetadataRequest } from '@buildeross/sdk/subgraph'
import { DaoContractAddresses, useChainStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import React from 'react'
import { useAccount } from 'wagmi'

import { getDaoLayout } from '../../../../layouts/DaoLayout'
import { NextPageWithLayout } from '../../../_app'

interface MigratePageProps {
  daoName: string
  addresses: DaoContractAddresses
  chainId: CHAIN_ID
}

const MigratePage: NextPageWithLayout<MigratePageProps> = ({
  daoName,
  addresses,
  chainId,
}) => {
  const { address: walletAddress, isConnected } = useAccount()
  const chain = useChainStore((x) => x.chain)

  // Check if user has migration access
  const hasMigrationAccess = React.useMemo(
    () => (walletAddress ? isMigrationAllowed(walletAddress) : false),
    [walletAddress]
  )

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

          {/* DAO Context */}
          <Box
            borderRadius="curved"
            borderStyle="solid"
            borderWidth="normal"
            borderColor="border"
            p="x4"
          >
            <Stack gap="x1">
              <Text fontSize="16" fontWeight="label">
                Migrating: {daoName}
              </Text>
              <Text fontSize="14" color="text3">
                Source Chain: {chain.name}
              </Text>
            </Stack>
          </Box>

          {/* Migration Form */}
          <Box>
            {addresses.token ? (
              <CrossChainMigrationProvider
                chainId={chainId}
                tokenAddress={addresses.token}
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

MigratePage.getLayout = (page) => getDaoLayout(page, { hideFooterOnMobile: true })

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

import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { useClankerTokens } from '@buildeross/hooks'
import { daoOGMetadataRequest } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID, RequiredDaoContractAddresses } from '@buildeross/types'
import { type CoinFormValues, ContentCoinPreview } from '@buildeross/ui'
import { DaoAvatar } from '@buildeross/ui/Avatar'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { isChainIdSupportedByCoining } from '@buildeross/utils'
import { Box, Flex, Spinner, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { getDaoLayout } from '../../../../../layouts/DaoLayout'
import * as styles from '../../../../../modules/coin/coinCreate.css'
import { CreateContentCoinForm } from '../../../../../modules/coin/CreateContentCoinForm'
import { NextPageWithLayout } from '../../../../_app'

interface CreateCoinPageProps {
  daoName: string
  addresses: RequiredDaoContractAddresses
  chainId: CHAIN_ID
}

const CreateCoinPage: NextPageWithLayout<CreateCoinPageProps> = ({
  daoName,
  addresses,
}) => {
  const { push } = useRouter()
  const chain = useChainStore((x) => x.chain)
  // State to track form values for preview
  const [previewData, setPreviewData] = useState<CoinFormValues>({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
    mediaUrl: '',
    mediaMimeType: '',
  })

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [createdCoinAddress, setCreatedCoinAddress] = useState<
    AddressType | null | undefined
  >(undefined)
  const isNavigatingRef = useRef(false)

  const onCoinCreated = (coinAddress: AddressType | null) => {
    setCreatedCoinAddress(coinAddress)
  }

  const handleCloseSuccessModal = useCallback(async () => {
    if (isNavigatingRef.current) return
    isNavigatingRef.current = true

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }

    try {
      if (createdCoinAddress) {
        await push({
          pathname: `/coin/[network]/[coinAddress]`,
          query: {
            network: chain.slug,
            coinAddress: createdCoinAddress,
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
      setCreatedCoinAddress(undefined)
    } finally {
      isNavigatingRef.current = false
    }
  }, [push, createdCoinAddress, chain.slug, addresses.token])

  useEffect(() => {
    if (createdCoinAddress !== undefined) {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
      }
      // Auto-close after 2 seconds
      successTimerRef.current = setTimeout(() => {
        handleCloseSuccessModal()
      }, 2000)
    }

    return () => {
      // Clear timer on cleanup
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
    }
  }, [handleCloseSuccessModal, createdCoinAddress])

  const isChainSupported = isChainIdSupportedByCoining(chain.id)

  // Fetch the latest ClankerToken for this DAO
  const { data: clankerTokens, isLoading } = useClankerTokens({
    chainId: chain.id,
    collectionAddress: addresses.token,
    enabled: isChainSupported,
    first: 1, // Only fetch the latest token
  })

  // Get the latest ClankerToken (first item in array)
  const latestClankerToken = React.useMemo(() => {
    return clankerTokens && clankerTokens.length > 0 ? clankerTokens[0] : null
  }, [clankerTokens])

  return (
    <Flex justify="center" py="x12" px="x4">
      <Box style={{ maxWidth: 1280, width: '100%' }}>
        <Stack gap="x6">
          {/* Header */}
          <Box>
            <Text fontSize="35" fontWeight="display" mb="x2">
              Publish Post
            </Text>
            <Text fontSize="16" color="text3">
              Share your content on-chain and enable supporters to collect and trade
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
            <Flex align="center" gap="x3">
              <DaoAvatar
                collectionAddress={addresses.token}
                auctionAddress={addresses.auction}
                chainId={chain.id}
                size="48"
              />
              <Stack gap="x1">
                <Text fontSize="16" fontWeight="label">
                  Creating for {daoName}
                </Text>
                <Text fontSize="14" color="text3">
                  {chain.name}
                </Text>
              </Stack>
            </Flex>
          </Box>

          {/* Two-column layout: Form on left, Preview on right */}
          <Box className={styles.twoColumnGrid}>
            {/* Left column: Form */}
            {isLoading ? (
              <Box p="x4">
                <Spinner />
              </Box>
            ) : (
              <Box>
                <CreateContentCoinForm
                  latestClankerToken={latestClankerToken}
                  onFormChange={setPreviewData}
                  onCoinCreated={onCoinCreated}
                />
              </Box>
            )}

            {/* Right column: Preview */}
            {latestClankerToken && (
              <Box className={styles.previewColumn}>
                <ContentCoinPreview
                  {...previewData}
                  chainId={chain.id}
                  daoName={daoName}
                />
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
      <AnimatedModal
        open={createdCoinAddress !== undefined}
        close={handleCloseSuccessModal}
      >
        <SuccessModalContent
          title={`Post published`}
          subtitle={`Your Post has been successfully published!`}
          success
        />
      </AnimatedModal>
    </Flex>
  )
}

CreateCoinPage.getLayout = getDaoLayout

export default CreateCoinPage

export const getServerSideProps: GetServerSideProps<CreateCoinPageProps> = async ({
  params,
}) => {
  const token = params?.token as AddressType
  const network = params?.network as string

  try {
    const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)
    if (!chain) throw new Error('Invalid network')

    // Fetch DAO metadata using the daoOGMetadata query
    const dao = await daoOGMetadataRequest(chain.id, token)

    if (!dao) throw new Error('DAO not found')

    const addresses: RequiredDaoContractAddresses = {
      token: token,
      metadata: dao.metadataAddress as AddressType,
      auction: dao.auctionAddress as AddressType,
      treasury: dao.treasuryAddress as AddressType,
      governor: dao.governorAddress as AddressType,
    }

    const props: CreateCoinPageProps = {
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

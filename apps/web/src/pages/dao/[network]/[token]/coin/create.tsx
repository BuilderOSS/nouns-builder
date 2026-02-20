import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { useClankerTokens } from '@buildeross/hooks'
import { daoOGMetadataRequest } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { type CoinFormValues, ContentCoinPreview } from '@buildeross/ui'
import { DaoAvatar } from '@buildeross/ui/Avatar'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { isChainIdSupportedByCoining } from '@buildeross/utils'
import { Box, Flex, Spinner, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { DefaultLayout } from '../../../../../layouts/DefaultLayout'
import * as styles from '../../../../../modules/coin/coinCreate.css'
import { CreateContentCoinForm } from '../../../../../modules/coin/CreateContentCoinForm'

interface CreateCoinPageProps {
  daoName: string
  collectionAddress: AddressType
  auctionAddress: AddressType
  treasuryAddress: AddressType
  chainId: CHAIN_ID
}

export default function CreateCoinPage({
  daoName,
  collectionAddress,
  auctionAddress,
  treasuryAddress,
  chainId,
}: CreateCoinPageProps) {
  const { push } = useRouter()
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

  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.id === chainId)!

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
            token: collectionAddress,
            tab: 'activity',
          },
        })
      }
      setCreatedCoinAddress(undefined)
    } finally {
      isNavigatingRef.current = false
    }
  }, [push, createdCoinAddress, chain.slug, collectionAddress])

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

  const isChainSupported = isChainIdSupportedByCoining(chainId)

  // Fetch the latest ClankerToken for this DAO
  const { data: clankerTokens, isLoading } = useClankerTokens({
    chainId,
    collectionAddress,
    enabled: isChainSupported,
    first: 1, // Only fetch the latest token
  })

  // Get the latest ClankerToken (first item in array)
  const latestClankerToken = React.useMemo(() => {
    return clankerTokens && clankerTokens.length > 0 ? clankerTokens[0] : null
  }, [clankerTokens])

  return (
    <DefaultLayout>
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
                  collectionAddress={collectionAddress}
                  auctionAddress={auctionAddress}
                  chainId={chainId}
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
                    chainId={chainId}
                    treasury={treasuryAddress}
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
                    chainId={chainId}
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
    </DefaultLayout>
  )
}

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

    const props: CreateCoinPageProps = {
      daoName: dao.name,
      collectionAddress: token,
      auctionAddress: dao.auctionAddress as AddressType,
      treasuryAddress: dao.treasuryAddress as AddressType,
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

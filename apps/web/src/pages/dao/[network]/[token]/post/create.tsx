import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { daoOGMetadataRequest } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { type CoinFormValues, ContentPostPreview } from '@buildeross/ui'
import { DaoAvatar } from '@buildeross/ui/Avatar'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import { DefaultLayout } from '../../../../../layouts/DefaultLayout'
import { CreateContentCoinForm } from '../../../../../modules/post/components/CreateContentCoinForm'
import * as styles from '../../../../../modules/post/styles/postCreate.css'

interface CreatePostPageProps {
  daoName: string
  collectionAddress: AddressType
  auctionAddress: AddressType
  treasuryAddress: AddressType
  chainId: CHAIN_ID
  network: string
}

export default function CreatePostPage({
  daoName,
  collectionAddress,
  auctionAddress,
  treasuryAddress,
  chainId,
  network,
}: CreatePostPageProps) {
  // State to track form values for preview
  const [previewData, setPreviewData] = useState<CoinFormValues>({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
    mediaUrl: '',
    mediaMimeType: '',
  })

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
                    {network}
                  </Text>
                </Stack>
              </Flex>
            </Box>

            {/* Two-column layout: Form on left, Preview on right */}
            <Box className={styles.twoColumnGrid}>
              {/* Left column: Form */}
              <Box>
                <CreateContentCoinForm
                  chainId={chainId}
                  treasury={treasuryAddress}
                  onFormChange={setPreviewData}
                />
              </Box>

              {/* Right column: Preview (hidden on mobile) */}
              <Box className={styles.previewColumn}>
                <ContentPostPreview
                  {...previewData}
                  chainId={chainId}
                  daoName={daoName}
                />
              </Box>
            </Box>
          </Stack>
        </Box>
      </Flex>
    </DefaultLayout>
  )
}

export const getServerSideProps: GetServerSideProps<CreatePostPageProps> = async ({
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

    const props: CreatePostPageProps = {
      daoName: dao.name,
      collectionAddress: token,
      auctionAddress: dao.auctionAddress as AddressType,
      treasuryAddress: dao.treasuryAddress as AddressType,
      chainId: chain.id,
      network: chain.name,
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

import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { daoOGMetadataRequest } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { DaoAvatar } from '@buildeross/ui/Avatar'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { DefaultLayout } from '../../../../../layouts/DefaultLayout'

interface CreatePostPageProps {
  daoName: string
  collectionAddress: AddressType
  auctionAddress: AddressType
  chainId: CHAIN_ID
  network: string
}

export default function CreatePostPage({
  daoName,
  collectionAddress,
  auctionAddress,
  chainId,
  network,
}: CreatePostPageProps) {
  const router = useRouter()
  const [postContent, setPostContent] = useState('')

  const handleCancel = () => {
    router.back()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement post creation logic
    // eslint-disable-next-line no-console
    console.log('Create post:', { network, collectionAddress, postContent })
  }

  return (
    <DefaultLayout>
      <Flex justify="center" py="x12" px="x4">
        <Box style={{ maxWidth: 640, width: '100%' }}>
          <Stack gap="x6">
            {/* Header */}
            <Box>
              <Text fontSize="35" fontWeight="display" mb="x2">
                Create Post
              </Text>
              <Text fontSize="16" color="text3">
                Share an update or announcement with the DAO community
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
                    Posting to {daoName}
                  </Text>
                  <Text fontSize="14" color="text3">
                    {network}
                  </Text>
                </Stack>
              </Flex>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="x4">
                {/* Content textarea */}
                <Box>
                  <Text fontSize="14" fontWeight="label" mb="x2">
                    Post Content
                  </Text>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={8}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--colors-border)',
                      backgroundColor: 'var(--colors-background2)',
                      color: 'var(--colors-text1)',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </Box>

                {/* Image upload placeholder */}
                <Box>
                  <Text fontSize="14" fontWeight="label" mb="x2">
                    Image (Optional)
                  </Text>
                  <Box
                    borderRadius="curved"
                    borderStyle="dashed"
                    borderWidth="normal"
                    borderColor="border"
                    p="x8"
                    style={{
                      textAlign: 'center',
                      cursor: 'not-allowed',
                      opacity: 0.6,
                    }}
                  >
                    <Text fontSize="14" color="text3">
                      Image upload coming soon
                    </Text>
                  </Box>
                </Box>

                {/* Action buttons */}
                <Flex gap="x3" justify="flex-end">
                  <Button variant="ghost" onClick={handleCancel} type="button">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!postContent.trim()}
                    style={{ cursor: 'not-allowed', opacity: 0.6 }}
                  >
                    Publish Post (Coming Soon)
                  </Button>
                </Flex>
              </Stack>
            </form>
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

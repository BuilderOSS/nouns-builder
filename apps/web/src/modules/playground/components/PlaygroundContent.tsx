import { normalizeIPFSUrl } from '@buildeross/ipfs-service/url'
import { Playground } from '@buildeross/ui/Playground'
import { Box, Button, Flex, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'
import type { DaoListItem } from 'src/modules/dashboard/SingleDaoSelector'

import { usePlaygroundData } from '../hooks/usePlaygroundData'
import {
  contentWrapper,
  exploreHeadingStyle,
  loadingContainer,
} from './PlaygroundContent.css'

// Extract folder CID from IPFS URI
const extractFolderCID = (uri: string): string | null => {
  const normalized = normalizeIPFSUrl(uri)
  if (!normalized) return null

  // Remove ipfs:// prefix
  const path = normalized.replace('ipfs://', '')

  // Extract CID (everything before the first /)
  const cidMatch = path.match(/^([^\/]+)/)
  return cidMatch ? cidMatch[1] : null
}

interface PlaygroundContentProps {
  dao: DaoListItem | undefined
}

export const PlaygroundContent: React.FC<PlaygroundContentProps> = ({ dao }) => {
  // Always call the hook to avoid conditional hook call (only when we have a DAO)
  const { images, orderedLayers, isLoading, error } = usePlaygroundData({
    chainId: dao?.chainId,
    metadataAddress: dao?.addresses.metadata,
  })

  // Get distinct folder CIDs for download links
  const folderCIDs = useMemo(() => {
    if (!images?.length) return []

    const cids = new Set<string>()
    images.forEach((image) => {
      const cid = extractFolderCID(image.uri)
      if (cid) {
        cids.add(cid)
      }
    })

    return Array.from(cids)
  }, [images])

  // Show DAO artwork mode (only when DAO is selected)

  if (isLoading) {
    return (
      <Flex className={loadingContainer}>
        <Stack align="center" gap="x4">
          <Spinner />
          <Text>Loading artwork data...</Text>
        </Stack>
      </Flex>
    )
  }

  if (error) {
    return (
      <Flex className={loadingContainer}>
        <Stack align="center" gap="x2">
          <Text color="negative">Failed to load artwork data</Text>
          <Text color="text3" size="sm">
            {error.message}
          </Text>
        </Stack>
      </Flex>
    )
  }

  if (!images?.length || !orderedLayers?.length) {
    return (
      <Flex className={loadingContainer}>
        <Stack align="center" gap="x2">
          <Text color="text3">No artwork data found for this DAO</Text>
          <Text color="text3" size="sm">
            This DAO may not have any generative artwork configured
          </Text>
        </Stack>
      </Flex>
    )
  }

  return (
    <Box className={contentWrapper}>
      <Flex
        direction="column"
        align="center"
        width="100%"
        p={'x6'}
        borderColor={'border'}
        borderStyle={'solid'}
        borderRadius={'curved'}
        borderWidth={'normal'}
        gap="x6"
      >
        {folderCIDs.length > 0 && (
          <Stack width="100%" align="flex-start">
            <Text variant="heading-md" className={exploreHeadingStyle}>
              Explore on IPFS
            </Text>
            <Stack gap="x2">
              {folderCIDs.map((cid) => (
                <Button
                  key={cid}
                  as="a"
                  href={`https://gateway.pinata.cloud/ipfs/${cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  px="x4"
                  style={{
                    justifyContent: 'space-between',
                    borderRadius: '12px',
                    minWidth: '245px',
                  }}
                >
                  <Flex align="center" gap="x2">
                    <Icon id="globe" size="sm" />
                    <Text style={{ fontSize: '14px' }}>
                      {cid.substring(0, 12)}...{cid.substring(cid.length - 8)}
                    </Text>
                  </Flex>
                  <Icon id="external-16" size="sm" />
                </Button>
              ))}
            </Stack>
          </Stack>
        )}

        <Playground images={images} orderedLayers={orderedLayers} />
      </Flex>
    </Box>
  )
}

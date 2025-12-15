import { Playground } from '@buildeross/ui/Playground'
import { Box, Flex, Spinner, Stack, Text } from '@buildeross/zord'
import React from 'react'
import type { DaoListItem } from 'src/modules/dashboard/SingleDaoSelector'

import { usePlaygroundData } from '../hooks/usePlaygroundData'
import { contentWrapper, loadingContainer } from './PlaygroundContent.css'

interface PlaygroundContentProps {
  dao: DaoListItem
}

export const PlaygroundContent: React.FC<PlaygroundContentProps> = ({ dao }) => {
  const { images, orderedLayers, isLoading, error } = usePlaygroundData({
    chainId: dao.chainId,
    metadataAddress: dao.addresses.metadata,
  })

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
      <Playground images={images} orderedLayers={orderedLayers} />
    </Box>
  )
}

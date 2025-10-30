import { useFeed } from '@buildeross/hooks'
import type { AddressType, CHAIN_ID, FeedItem as FeedItemType } from '@buildeross/types'
import { Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { FeedItem } from './FeedItem'
import { FeedSkeleton } from './FeedSkeleton'
import { LoadMoreButton } from './LoadMoreButton'

export interface FeedProps {
  chainId?: CHAIN_ID
  daoAddress?: AddressType
  actor?: AddressType
  limit?: number
  enabled?: boolean
  onError?: (error: Error & { status?: number; body?: unknown }) => void
}

export const Feed: React.FC<FeedProps> = ({
  chainId,
  daoAddress,
  actor,
  limit,
  enabled,
  onError,
}) => {
  const { items, hasMore, isLoading, isLoadingMore, error, fetchNextPage } = useFeed({
    chainId,
    daoAddress,
    actor,
    limit,
    enabled,
    onError,
  })

  if (error) {
    return (
      <Flex w="100%" justify="center" align="center" py="x16">
        <Text color="negative">Failed to load feed. Please try again later.</Text>
      </Flex>
    )
  }

  if (isLoading) {
    return <FeedSkeleton />
  }

  if (items.length === 0) {
    return (
      <Flex w="100%" justify="center" align="center" py="x16">
        <Text color="tertiary">No activity yet</Text>
      </Flex>
    )
  }

  return (
    <Stack gap="x4" w="100%" pb="x4">
      {items.map((item: FeedItemType) => (
        <FeedItem key={item.id} item={item} hideActor={!!actor} />
      ))}

      {isLoadingMore && <FeedSkeleton count={3} />}

      {hasMore && !isLoadingMore && (
        <LoadMoreButton onClick={fetchNextPage} isLoading={isLoadingMore} />
      )}
    </Stack>
  )
}

import { useFeed } from '@buildeross/hooks'
import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID, FeedItem as FeedItemType } from '@buildeross/types'
import { Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { FeedItem } from './FeedItem'
import { FeedSkeleton } from './FeedSkeleton'
import { LoadMoreButton } from './LoadMoreButton'

export interface FeedProps {
  chainId?: CHAIN_ID
  daos?: AddressType[]
  eventTypes?: FeedEventType[]
  actor?: AddressType
  limit?: number
  enabled?: boolean
  onError?: (error: Error & { status?: number; body?: unknown }) => void
}

export const Feed: React.FC<FeedProps> = ({
  chainId,
  daos,
  eventTypes,
  actor,
  limit,
  enabled,
  onError,
}) => {
  const { items, hasMore, isLoading, isLoadingMore, error, fetchNextPage } = useFeed({
    chainId,
    daos,
    eventTypes,
    actor,
    limit,
    enabled,
    onError,
  })

  if (error) {
    return (
      <Flex w="100%" justify="center">
        <Flex
          w="100%"
          justify="center"
          align="center"
          py="x16"
          style={{ maxWidth: '480px' }}
        >
          <Text color="negative">Failed to load feed. Please try again later.</Text>
        </Flex>
      </Flex>
    )
  }

  if (isLoading) {
    return (
      <Flex w="100%" justify="center">
        <Stack gap="x4" w="100%" style={{ maxWidth: '480px' }} py="x4">
          <FeedSkeleton />
        </Stack>
      </Flex>
    )
  }

  if (items.length === 0) {
    return (
      <Flex w="100%" justify="center">
        <Flex
          w="100%"
          justify="center"
          align="center"
          py="x16"
          style={{ maxWidth: '480px' }}
        >
          <Text color="tertiary">No activity yet</Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex w="100%" justify="center">
      <Stack gap="x4" w="100%" py="x4" style={{ maxWidth: '480px' }}>
        {items.map((item: FeedItemType) => (
          <FeedItem
            key={item.id}
            item={item}
            hideActor={!!actor}
            hideDao={!!(daos && daos.length > 0)}
          />
        ))}

        {isLoadingMore && <FeedSkeleton count={3} />}

        {hasMore && !isLoadingMore && (
          <LoadMoreButton onClick={fetchNextPage} isLoading={isLoadingMore} />
        )}

        {!hasMore && !isLoadingMore && (
          <Flex w="100%" justify="center" align="center" py="x8">
            <Text color="tertiary">No more feed content to show</Text>
          </Flex>
        )}
      </Stack>
    </Flex>
  )
}

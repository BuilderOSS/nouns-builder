import { useFeed } from '@buildeross/hooks'
import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID, FeedItem as FeedItemType } from '@buildeross/types'
import { Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

import { FeedFiltersModal } from './FeedFiltersModal'
import { FeedItem } from './FeedItem'
import { FeedSkeleton, FeedSkeletonItem } from './FeedSkeleton'
import { LoadMoreButton } from './LoadMoreButton'
import { useFeedFiltersStore } from './useFeedFiltersStore'

// Internal filter mode - Feed manages its own filters
interface InternalFilterMode {
  chainIds?: never
  daos?: never
  eventTypes?: never
  actor?: never
  limit?: number
  onError?: (error: Error & { status?: number; body?: unknown }) => void
  enableFeed?: boolean
  enableFilters?: boolean
  enableInfiniteScroll?: boolean
}

// External filter mode - Feed accepts filters from parent
interface ExternalFilterMode {
  chainIds?: CHAIN_ID[]
  daos?: AddressType[]
  eventTypes?: FeedEventType[]
  actor?: AddressType
  limit?: number
  onError?: (error: Error & { status?: number; body?: unknown }) => void
  enableFeed?: boolean
  enableFilters?: never
  enableInfiniteScroll?: boolean
}

export type FeedProps = InternalFilterMode | ExternalFilterMode

function isExternalFilterMode(props: FeedProps): props is ExternalFilterMode {
  return (
    props.chainIds !== undefined ||
    props.daos !== undefined ||
    props.eventTypes !== undefined ||
    props.actor !== undefined ||
    props.enableFilters !== true
  )
}

export const Feed: React.FC<FeedProps> = (props) => {
  const { actor, limit, enableFeed, onError, enableInfiniteScroll = true } = props

  // Determine if we're in external filter mode
  const externalFilterMode = isExternalFilterMode(props)

  // Internal filter state (only used if not in external mode)
  const { address } = useAccount()
  const filterStore = useFeedFiltersStore(externalFilterMode ? undefined : address)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // Get actual filters to use (either from props or from store)
  const actualChainIds = useMemo(() => {
    if (externalFilterMode) return props.chainIds
    return filterStore.chainIds.length > 0 ? filterStore.chainIds : undefined
  }, [externalFilterMode, props, filterStore.chainIds])

  const actualDaos = useMemo(() => {
    if (externalFilterMode) return props.daos
    if (filterStore.daoFilterMode === 'specific' && filterStore.daoAddresses.length > 0) {
      return filterStore.daoAddresses as AddressType[]
    }
    return undefined
  }, [externalFilterMode, props, filterStore.daoFilterMode, filterStore.daoAddresses])

  const actualEventTypes = useMemo(() => {
    if (externalFilterMode) return props.eventTypes
    return filterStore.eventTypes.length > 0 ? filterStore.eventTypes : undefined
  }, [externalFilterMode, props, filterStore.eventTypes])

  const { items, hasMore, isLoading, isLoadingMore, error, fetchNextPage } = useFeed({
    chainIds: actualChainIds,
    daos: actualDaos,
    eventTypes: actualEventTypes,
    actor,
    limit,
    enabled: enableFeed,
    onError,
  })

  // Filter modal handlers (only used in internal mode)
  const handleApplyFilters = useCallback(
    (values: {
      chainIds: CHAIN_ID[]
      eventTypes: FeedEventType[]
      daoFilterMode: 'all' | 'specific'
      daoAddresses: AddressType[]
    }) => {
      if (!externalFilterMode) {
        filterStore.setChainIds(values.chainIds)
        filterStore.setEventTypes(values.eventTypes)
        filterStore.setDaoFilterMode(values.daoFilterMode)
        filterStore.setDaoAddresses(values.daoAddresses)
      }
    },
    [externalFilterMode, filterStore]
  )

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Infinite scroll: automatically load more when loadMoreRef comes into view
  useEffect(() => {
    if (!hasMore || isLoadingMore || !enableInfiniteScroll) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )

    const current = loadMoreRef.current
    if (current) observer.observe(current)

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [hasMore, isLoadingMore, fetchNextPage, enableInfiniteScroll])

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

  return (
    <Flex w="100%" justify="center" direction="column" align="center">
      {/* Customize Feed button - only shown in internal filter mode */}
      {!externalFilterMode && (
        <Flex w="100%" justify="flex-end" style={{ maxWidth: '480px' }} pb="x4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterModalOpen(true)}
            style={{ gap: '8px' }}
          >
            <Icon id="sliders" size="sm" />
            Customize Feed
          </Button>
        </Flex>
      )}

      <Stack gap="x4" w="100%" py="x4" style={{ maxWidth: '480px' }}>
        {items.length === 0 && (
          <Text color="tertiary" textAlign="center" w="100%">
            {!externalFilterMode && filterStore.hasActiveFilters()
              ? 'No results match your current filters'
              : 'No activity yet'}
          </Text>
        )}

        {items.length > 0 && (
          <>
            {items.map((item: FeedItemType) => (
              <FeedItem
                key={item.id}
                item={item}
                hideActor={!!actor}
                hideDao={!!(actualDaos && actualDaos.length > 0)}
              />
            ))}

            {isLoadingMore && <FeedSkeleton count={3} />}

            {/* Infinite scroll sentinel */}
            {hasMore && !isLoadingMore && enableInfiniteScroll && (
              <div ref={loadMoreRef}>
                <FeedSkeletonItem />
              </div>
            )}

            {hasMore && !isLoadingMore && !enableInfiniteScroll && (
              <LoadMoreButton
                onClick={() => {
                  fetchNextPage()
                }}
                isLoading={isLoadingMore}
              />
            )}

            {!hasMore && !isLoadingMore && (
              <Flex w="100%" justify="center" align="center" py="x8">
                <Text color="tertiary">No more feed content to show</Text>
              </Flex>
            )}
          </>
        )}
      </Stack>

      {/* Filter modal - only used in internal mode */}
      {!externalFilterMode && (
        <FeedFiltersModal
          open={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          chainIds={filterStore.chainIds}
          eventTypes={filterStore.eventTypes}
          daoFilterMode={filterStore.daoFilterMode}
          daoAddresses={filterStore.daoAddresses}
          onApply={handleApplyFilters}
          userAddress={address}
        />
      )}
    </Flex>
  )
}

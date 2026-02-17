import { useFeed } from '@buildeross/hooks'
import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID, FeedItem as FeedItemType } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { SwapWidget } from '@buildeross/ui/SwapWidget'
import { Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

import { FeedFiltersModal } from './FeedFiltersModal'
import { FeedItem } from './FeedItem'
import { FeedSkeleton, FeedSkeletonItem } from './FeedSkeleton'
import { LoadMoreButton } from './LoadMoreButton'
import { BidModal } from './Modals/BidModal'
import { PropdateModalWrapper } from './Modals/PropdateModalWrapper'
import { VoteModalWrapper } from './Modals/VoteModalWrapper'
import type {
  BidModalState,
  PropdateModalState,
  TradeModalState,
  VoteModalState,
} from './types/modalStates'
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

  // Shared modal states for all feed items
  const [bidModalState, setBidModalState] = useState<BidModalState | null>(null)
  const [voteModalState, setVoteModalState] = useState<VoteModalState | null>(null)
  const [propdateModalState, setPropdateModalState] = useState<PropdateModalState | null>(
    null
  )
  const [tradeModalState, setTradeModalState] = useState<TradeModalState | null>(null)

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

  const hideActor = !!actor
  const hideDao = externalFilterMode && !!(actualDaos && actualDaos.length > 0)

  // Modal callbacks
  const handleOpenBidModal = useCallback((state: BidModalState) => {
    setBidModalState(state)
  }, [])

  const handleOpenVoteModal = useCallback((state: VoteModalState) => {
    setVoteModalState(state)
  }, [])

  const handleOpenPropdateModal = useCallback((state: PropdateModalState) => {
    setPropdateModalState(state)
  }, [])

  const handleOpenTradeModal = useCallback((state: TradeModalState) => {
    setTradeModalState(state)
  }, [])

  // Filter modal handlers (only used in internal mode)
  const handleApplyFilters = useCallback(
    (values: {
      chainIds: CHAIN_ID[]
      eventTypes: FeedEventType[]
      daoFilterMode: 'all' | 'specific'
      daoAddresses: AddressType[]
      selectedDaos: Array<{
        address: AddressType
        name: string
        image: string
        chainId: CHAIN_ID
      }>
    }) => {
      if (!externalFilterMode) {
        filterStore.setChainIds(values.chainIds)
        filterStore.setEventTypes(values.eventTypes)
        filterStore.setDaoFilterMode(values.daoFilterMode)
        filterStore.setDaoAddresses(values.daoAddresses)
        filterStore.setSelectedDaos(values.selectedDaos)
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
          style={{ maxWidth: '1440px' }}
        >
          <Text color="negative">Failed to load feed. Please try again later.</Text>
        </Flex>
      </Flex>
    )
  }

  if (isLoading) {
    return (
      <Flex w="100%" justify="center">
        <Stack gap="x4" w="100%" style={{ maxWidth: '1440px' }} pb="x4">
          <FeedSkeleton />
        </Stack>
      </Flex>
    )
  }

  return (
    <Flex w="100%" justify="center" direction="column" align="center">
      {/* Customize Feed button - only shown in internal filter mode and when user is connected */}
      {!externalFilterMode && address && (
        <Flex w="100%" justify="flex-end" style={{ maxWidth: '1440px' }} pb="x4">
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

      <Stack gap="x6" w="100%" pb="x4" style={{ maxWidth: '1440px' }}>
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
                hideActor={hideActor}
                hideDao={hideDao}
                onOpenBidModal={handleOpenBidModal}
                onOpenVoteModal={handleOpenVoteModal}
                onOpenPropdateModal={handleOpenPropdateModal}
                onOpenTradeModal={handleOpenTradeModal}
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
          selectedDaos={filterStore.selectedDaos}
          onApply={handleApplyFilters}
          userAddress={address}
        />
      )}

      {/* Shared modals for all feed items */}
      {bidModalState && (
        <BidModal
          isOpen={!!bidModalState}
          onClose={() => setBidModalState(null)}
          chainId={bidModalState.chainId}
          tokenId={bidModalState.tokenId}
          daoName={bidModalState.daoName}
          addresses={bidModalState.addresses}
          highestBid={bidModalState.highestBid}
          paused={bidModalState.paused}
          highestBidder={bidModalState.highestBidder}
          endTime={bidModalState.endTime}
          tokenName={bidModalState.tokenName}
        />
      )}

      {voteModalState && (
        <VoteModalWrapper
          isOpen={!!voteModalState}
          onClose={() => setVoteModalState(null)}
          proposalId={voteModalState.proposalId}
          proposalTitle={voteModalState.proposalTitle}
          proposalTimeCreated={voteModalState.proposalTimeCreated}
          chainId={voteModalState.chainId}
          addresses={voteModalState.addresses}
        />
      )}

      {propdateModalState && (
        <PropdateModalWrapper
          isOpen={!!propdateModalState}
          onClose={() => setPropdateModalState(null)}
          proposalId={propdateModalState.proposalId}
          chainId={propdateModalState.chainId}
          addresses={propdateModalState.addresses}
          replyTo={propdateModalState.replyTo}
        />
      )}

      {tradeModalState && (
        <AnimatedModal
          open={!!tradeModalState}
          close={() => setTradeModalState(null)}
          size="medium"
        >
          <div style={{ padding: '24px' }}>
            <Text variant="heading-md" mb="x4">
              Trade {tradeModalState.symbol}
            </Text>
            <SwapWidget
              coinAddress={tradeModalState.coinAddress as `0x${string}`}
              symbol={tradeModalState.symbol}
              chainId={tradeModalState.chainId as CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA}
            />
          </div>
        </AnimatedModal>
      )}
    </Flex>
  )
}

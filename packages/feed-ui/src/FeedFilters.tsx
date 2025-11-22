import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import type { MyDaosResponse } from '@buildeross/sdk/subgraph'
import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import { Button, Flex, Icon, Label, PopUp, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useMemo, useState } from 'react'

import { filterButton, filterItem, filterPopup } from './FeedFilters.css'

export interface FeedFiltersProps {
  chainIds: CHAIN_ID[]
  eventTypes: FeedEventType[]
  showMemberDaosOnly: boolean
  memberDaos: MyDaosResponse
  onChainIdsChange: (chainIds: CHAIN_ID[]) => void
  onEventTypesChange: (eventTypes: FeedEventType[]) => void
  onShowMemberDaosOnlyChange: (showMemberDaosOnly: boolean) => void
}

const EVENT_TYPE_LABELS: Record<FeedEventType, string> = {
  [FeedEventType.AuctionCreated]: 'Auction Created',
  [FeedEventType.AuctionBidPlaced]: 'Auction Bid',
  [FeedEventType.AuctionSettled]: 'Auction Settled',
  [FeedEventType.ProposalCreated]: 'Proposal Created',
  [FeedEventType.ProposalVoted]: 'Proposal Vote',
  [FeedEventType.ProposalExecuted]: 'Proposal Executed',
  [FeedEventType.ProposalUpdated]: 'Proposal Update',
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  chainIds,
  eventTypes,
  showMemberDaosOnly,
  memberDaos,
  onChainIdsChange,
  onEventTypesChange,
  onShowMemberDaosOnlyChange,
}) => {
  const [chainsOpen, setChainsOpen] = useState(false)
  const [eventsOpen, setEventsOpen] = useState(false)
  const [daosOpen, setDaosOpen] = useState(false)

  const toggleChain = useCallback(
    (chainId: CHAIN_ID) => {
      if (chainIds.includes(chainId)) {
        onChainIdsChange(chainIds.filter((id) => id !== chainId))
      } else {
        onChainIdsChange([...chainIds, chainId])
      }
    },
    [chainIds, onChainIdsChange]
  )

  const toggleEventType = useCallback(
    (eventType: FeedEventType) => {
      if (eventTypes.includes(eventType)) {
        onEventTypesChange(eventTypes.filter((type) => type !== eventType))
      } else {
        onEventTypesChange([...eventTypes, eventType])
      }
    },
    [eventTypes, onEventTypesChange]
  )

  const chainFilterLabel = useMemo(() => {
    if (chainIds.length === 0) return 'All Chains'
    if (chainIds.length === 1) {
      const chain = PUBLIC_DEFAULT_CHAINS.find((c) => c.id === chainIds[0])
      return chain?.name || 'Chain'
    }
    return `${chainIds.length} Chains`
  }, [chainIds])

  const eventFilterLabel = useMemo(() => {
    if (eventTypes.length === 0) return 'All Events'
    if (eventTypes.length === 1) {
      return EVENT_TYPE_LABELS[eventTypes[0]]
    }
    return `${eventTypes.length} Events`
  }, [eventTypes])

  const daoFilterLabel = useMemo(() => {
    if (!showMemberDaosOnly) return 'All DAOs'
    return 'My DAOs'
  }, [showMemberDaosOnly])

  const hasFilters = chainIds.length > 0 || eventTypes.length > 0 || showMemberDaosOnly

  return (
    <Flex gap="x2" align="center" wrap="wrap">
      {/* Chains Filter */}
      <PopUp
        trigger={
          <Button variant="outline" size="xs" px="x3" className={filterButton}>
            {chainFilterLabel}
            <Icon id="chevronDown" size="sm" />
          </Button>
        }
        open={chainsOpen}
        onOpenChange={setChainsOpen}
        placement="bottom-start"
      >
        <Stack gap="x2" className={filterPopup}>
          <Text fontSize="14" fontWeight="display">
            Filter by Chain
          </Text>
          {PUBLIC_DEFAULT_CHAINS.map((chain) => (
            <Label
              key={chain.id}
              className={filterItem}
              onClick={() => toggleChain(chain.id)}
            >
              <input
                type="checkbox"
                checked={chainIds.includes(chain.id)}
                onChange={() => toggleChain(chain.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <Flex align="center" gap="x2">
                <img
                  src={chain.icon}
                  alt={chain.name}
                  width="16"
                  height="16"
                  style={{ height: '1em', width: '1em' }}
                />
                <Text fontSize="14">{chain.name}</Text>
              </Flex>
            </Label>
          ))}
        </Stack>
      </PopUp>

      {/* Event Types Filter */}
      <PopUp
        trigger={
          <Button variant="outline" size="xs" px="x3" className={filterButton}>
            {eventFilterLabel}
            <Icon id="chevronDown" size="sm" />
          </Button>
        }
        open={eventsOpen}
        onOpenChange={setEventsOpen}
        placement="bottom-start"
      >
        <Stack gap="x2" className={filterPopup}>
          <Text fontSize="14" fontWeight="display">
            Filter by Event Type
          </Text>
          {Object.entries(EVENT_TYPE_LABELS).map(([eventType, label]) => (
            <Label
              key={eventType}
              className={filterItem}
              onClick={() => toggleEventType(eventType as FeedEventType)}
            >
              <input
                type="checkbox"
                checked={eventTypes.includes(eventType as FeedEventType)}
                onChange={() => toggleEventType(eventType as FeedEventType)}
                onClick={(e) => e.stopPropagation()}
              />
              <Text fontSize="14">{label}</Text>
            </Label>
          ))}
        </Stack>
      </PopUp>

      {/* DAOs Filter (only show if user has member DAOs) */}
      {memberDaos.length > 0 && (
        <PopUp
          trigger={
            <Button variant="outline" size="xs" px="x3" className={filterButton}>
              {daoFilterLabel}
              <Icon id="chevronDown" size="sm" />
            </Button>
          }
          open={daosOpen}
          onOpenChange={setDaosOpen}
          placement="bottom-start"
        >
          <Stack gap="x2" className={filterPopup}>
            <Text fontSize="14" fontWeight="display">
              Filter by DAOs
            </Text>
            <Label
              className={filterItem}
              onClick={() => onShowMemberDaosOnlyChange(false)}
            >
              <input
                type="radio"
                name="dao-filter"
                checked={!showMemberDaosOnly}
                onChange={() => onShowMemberDaosOnlyChange(false)}
                onClick={(e) => e.stopPropagation()}
              />
              <Text fontSize="14">All DAOs</Text>
            </Label>
            <Label
              className={filterItem}
              onClick={() => onShowMemberDaosOnlyChange(true)}
            >
              <input
                type="radio"
                name="dao-filter"
                checked={showMemberDaosOnly}
                onChange={() => onShowMemberDaosOnlyChange(true)}
                onClick={(e) => e.stopPropagation()}
              />
              <Text fontSize="14">My DAOs ({memberDaos.length})</Text>
            </Label>
          </Stack>
        </PopUp>
      )}

      {/* Clear filters button */}
      {hasFilters && (
        <Button
          variant="outline"
          size="xs"
          px="x3"
          onClick={() => {
            onChainIdsChange([])
            onEventTypesChange([])
            onShowMemberDaosOnlyChange(false)
          }}
        >
          Clear Filters
        </Button>
      )}
    </Flex>
  )
}

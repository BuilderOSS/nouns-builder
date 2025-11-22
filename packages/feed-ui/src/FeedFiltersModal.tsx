import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui'
import { Button, Flex, Label, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useMemo } from 'react'

import { CustomDaoSelector } from './CustomDaoSelector'
import {
  chainIcon,
  filterGrid,
  filterItem,
  filterSection,
  filterSummary as filterSummaryStyles,
  modalBody,
  modalFooter,
  modalHeader,
  modalTitle,
  radioGroup,
  sectionLabel,
  summaryChip,
} from './FeedFiltersModal.css'
import type { DaoFilterMode } from './useFeedFiltersStore'

export interface FeedFiltersModalProps {
  open: boolean
  onClose: () => void
  chainIds: CHAIN_ID[]
  eventTypes: FeedEventType[]
  daoFilterMode: DaoFilterMode
  daoAddresses: string[]
  onChainIdsChange: (chainIds: CHAIN_ID[]) => void
  onEventTypesChange: (eventTypes: FeedEventType[]) => void
  onDaoFilterModeChange: (mode: DaoFilterMode) => void
  onDaoAddressesChange: (addresses: string[]) => void
  onReset: () => void
  onApply: () => void
  userAddress?: string
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

export const FeedFiltersModal: React.FC<FeedFiltersModalProps> = ({
  open,
  onClose,
  chainIds,
  eventTypes,
  daoFilterMode,
  daoAddresses,
  onChainIdsChange,
  onEventTypesChange,
  onDaoFilterModeChange,
  onDaoAddressesChange,
  onReset,
  onApply,
  userAddress,
}) => {
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

  // Generate filter summary
  const filterSummary = useMemo(() => {
    const parts: string[] = []
    if (chainIds.length > 0) {
      parts.push(`${chainIds.length} chain${chainIds.length > 1 ? 's' : ''}`)
    }
    if (eventTypes.length > 0) {
      parts.push(`${eventTypes.length} event${eventTypes.length > 1 ? 's' : ''}`)
    }
    if (daoFilterMode === 'specific' && daoAddresses.length > 0) {
      parts.push(`${daoAddresses.length} DAO${daoAddresses.length > 1 ? 's' : ''}`)
    }
    return parts
  }, [chainIds, eventTypes, daoFilterMode, daoAddresses])

  const hasFilters =
    chainIds.length > 0 ||
    eventTypes.length > 0 ||
    (daoFilterMode === 'specific' && daoAddresses.length > 0)

  return (
    <AnimatedModal open={open} close={onClose} size="large">
      <Stack>
        {/* Header */}
        <div className={modalHeader}>
          <Text className={modalTitle}>Customize Feed</Text>
          {hasFilters && (
            <div className={filterSummaryStyles}>
              <Text fontSize="14" color="text3">
                Active filters:
              </Text>
              {filterSummary.map((part, idx) => (
                <span key={idx} className={summaryChip}>
                  {part}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className={modalBody}>
          {/* Chains Filter */}
          <div className={filterSection}>
            <Text className={sectionLabel}>Chains</Text>
            <div className={filterGrid}>
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
                  <img src={chain.icon} alt={chain.name} className={chainIcon} />
                  <Text fontSize="14">{chain.name}</Text>
                </Label>
              ))}
            </div>
          </div>

          {/* Event Types Filter */}
          <div className={filterSection}>
            <Text className={sectionLabel}>Event Types</Text>
            <div className={filterGrid}>
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
            </div>
          </div>

          {/* DAOs Filter */}
          <div className={filterSection}>
            <Text className={sectionLabel}>DAOs</Text>
            <div className={radioGroup}>
              <Label className={filterItem} onClick={() => onDaoFilterModeChange('all')}>
                <input
                  type="radio"
                  name="dao-filter-mode"
                  checked={daoFilterMode === 'all'}
                  onChange={() => onDaoFilterModeChange('all')}
                  onClick={(e) => e.stopPropagation()}
                />
                <Text fontSize="14">All DAOs</Text>
              </Label>
              <Label
                className={filterItem}
                onClick={() => onDaoFilterModeChange('specific')}
              >
                <input
                  type="radio"
                  name="dao-filter-mode"
                  checked={daoFilterMode === 'specific'}
                  onChange={() => onDaoFilterModeChange('specific')}
                  onClick={(e) => e.stopPropagation()}
                />
                <Text fontSize="14">Specific DAOs</Text>
              </Label>
            </div>

            {daoFilterMode === 'specific' && (
              <CustomDaoSelector
                selectedDaoAddresses={daoAddresses}
                onSelectedDaosChange={onDaoAddressesChange}
                userAddress={userAddress}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <Flex className={modalFooter}>
          <Button variant="outline" onClick={onReset} disabled={!hasFilters}>
            Reset
          </Button>
          <Button onClick={onApply}>Apply Filters</Button>
        </Flex>
      </Stack>
    </AnimatedModal>
  )
}

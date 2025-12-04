import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui'
import { Button, Flex, Label, Stack, Text } from '@buildeross/zord'
import { useFormik } from 'formik'
import React, { useMemo } from 'react'

import { CustomDaoSelector, type SelectedDaoMetadata } from './CustomDaoSelector'
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
  daoAddresses: AddressType[]
  selectedDaos: SelectedDaoMetadata[]
  onApply: (values: {
    chainIds: CHAIN_ID[]
    eventTypes: FeedEventType[]
    daoFilterMode: DaoFilterMode
    daoAddresses: AddressType[]
    selectedDaos: SelectedDaoMetadata[]
  }) => void
  userAddress?: AddressType
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
  selectedDaos,
  onApply,
  userAddress,
}) => {
  const formik = useFormik({
    initialValues: {
      chainIds,
      eventTypes,
      daoFilterMode,
      daoAddresses,
      selectedDaos,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      onApply(values)
      onClose()
    },
  })

  const toggleChain = (chainId: CHAIN_ID) => {
    const currentChainIds = formik.values.chainIds
    if (currentChainIds.includes(chainId)) {
      formik.setFieldValue(
        'chainIds',
        currentChainIds.filter((id) => id !== chainId)
      )
    } else {
      formik.setFieldValue('chainIds', [...currentChainIds, chainId])
    }
  }

  const toggleEventType = (eventType: FeedEventType) => {
    const currentEventTypes = formik.values.eventTypes
    if (currentEventTypes.includes(eventType)) {
      formik.setFieldValue(
        'eventTypes',
        currentEventTypes.filter((type) => type !== eventType)
      )
    } else {
      formik.setFieldValue('eventTypes', [...currentEventTypes, eventType])
    }
  }

  const handleCancel = () => {
    formik.resetForm()
    onClose()
  }

  const handleResetToDefaults = () => {
    formik.setValues({
      chainIds: [],
      eventTypes: [],
      daoFilterMode: 'all',
      daoAddresses: [],
      selectedDaos: [],
    })
  }

  // Generate filter summary based on form values
  const filterSummary = useMemo(() => {
    const parts: string[] = []
    if (formik.values.chainIds.length > 0) {
      parts.push(
        `${formik.values.chainIds.length} chain${formik.values.chainIds.length > 1 ? 's' : ''}`
      )
    }
    if (formik.values.eventTypes.length > 0) {
      parts.push(
        `${formik.values.eventTypes.length} event${formik.values.eventTypes.length > 1 ? 's' : ''}`
      )
    }
    if (
      formik.values.daoFilterMode === 'specific' &&
      formik.values.daoAddresses.length > 0
    ) {
      parts.push(
        `${formik.values.daoAddresses.length} DAO${formik.values.daoAddresses.length > 1 ? 's' : ''}`
      )
    }
    return parts
  }, [formik.values])

  const hasFilters =
    formik.values.chainIds.length > 0 ||
    formik.values.eventTypes.length > 0 ||
    (formik.values.daoFilterMode === 'specific' && formik.values.daoAddresses.length > 0)

  return (
    <AnimatedModal open={open} close={handleCancel} size="large">
      <form onSubmit={formik.handleSubmit}>
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
                      checked={formik.values.chainIds.includes(chain.id)}
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
                      checked={formik.values.eventTypes.includes(
                        eventType as FeedEventType
                      )}
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
                <Label
                  className={filterItem}
                  onClick={() => formik.setFieldValue('daoFilterMode', 'all')}
                >
                  <input
                    type="radio"
                    name="dao-filter-mode"
                    checked={formik.values.daoFilterMode === 'all'}
                    onChange={() => formik.setFieldValue('daoFilterMode', 'all')}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Text fontSize="14">All DAOs</Text>
                </Label>
                <Label
                  className={filterItem}
                  onClick={() => formik.setFieldValue('daoFilterMode', 'specific')}
                >
                  <input
                    type="radio"
                    name="dao-filter-mode"
                    checked={formik.values.daoFilterMode === 'specific'}
                    onChange={() => formik.setFieldValue('daoFilterMode', 'specific')}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Text fontSize="14">Specific DAOs</Text>
                </Label>
              </div>

              {formik.values.daoFilterMode === 'specific' && (
                <CustomDaoSelector
                  chainIds={formik.values.chainIds}
                  selectedDaoAddresses={formik.values.daoAddresses}
                  selectedDaosMetadata={formik.values.selectedDaos}
                  onSelectedDaosChange={(addresses, metadata) => {
                    formik.setFieldValue('daoAddresses', addresses)
                    formik.setFieldValue('selectedDaos', metadata)
                  }}
                  userAddress={userAddress}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <Flex className={modalFooter}>
            <Button variant="ghost" onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              type="button"
              disabled={!hasFilters}
            >
              Reset to Defaults
            </Button>
            <Button type="submit">Apply Filters</Button>
          </Flex>
        </Stack>
      </form>
    </AnimatedModal>
  )
}

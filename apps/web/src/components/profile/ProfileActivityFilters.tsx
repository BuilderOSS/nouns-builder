import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import { Button, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'
import { useDropdownDismiss } from 'src/hooks/useDropdownDismiss'
import {
  activeDaoFilterChip,
  activeDaoFilterHelp,
  activityTypeDropdown,
  activityTypeDropdownButton,
  activityTypeDropdownMenu,
  activityTypeDropdownOption,
  filterBar,
  filterControl,
  filterHeader,
  filterLabel,
  filterRightControls,
} from 'src/styles/profile.css'
import { createDaoKey } from 'src/utils/profileDashboard'

export type ProfileActivityFiltersValue = {
  eventTypes: FeedEventType[]
  daoKeys: string[]
}

type ProfileActivityFiltersProps = {
  daos: Array<{
    chainId: CHAIN_ID
    collectionAddress: string
    name: string
  }>
  value: ProfileActivityFiltersValue
  onChange: (value: ProfileActivityFiltersValue) => void
  onReset: () => void
}

const EVENT_TYPE_OPTIONS: Array<{ value: FeedEventType; label: string }> = [
  { value: FeedEventType.ProposalCreated, label: 'Proposals created' },
  { value: FeedEventType.ProposalVoted, label: 'Votes cast' },
  { value: FeedEventType.ProposalUpdated, label: 'Proposal updates' },
  { value: FeedEventType.ProposalExecuted, label: 'Proposals executed' },
  { value: FeedEventType.AuctionCreated, label: 'Auctions created' },
  { value: FeedEventType.AuctionBidPlaced, label: 'Bids placed' },
  { value: FeedEventType.AuctionSettled, label: 'Auctions settled' },
  { value: FeedEventType.ClankerTokenCreated, label: 'Creator coins deployed' },
  { value: FeedEventType.ZoraCoinCreated, label: 'Posts published' },
  { value: FeedEventType.ZoraDropCreated, label: 'Drops created' },
]

export const ProfileActivityFilters: React.FC<ProfileActivityFiltersProps> = ({
  daos,
  value,
  onChange,
  onReset,
}) => {
  const [isActivityTypeMenuOpen, setIsActivityTypeMenuOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement | null>(null)
  const dropdownButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const daoFilterHelpId = React.useId()
  const activeFilterCount =
    Number(value.eventTypes.length > 0) + Number(value.daoKeys.length > 0)
  const selectedEventTypeValues = React.useMemo(
    () => new Set(value.eventTypes),
    [value.eventTypes]
  )
  const activityTypeButtonLabel =
    value.eventTypes.length === 0
      ? 'All activity'
      : value.eventTypes.length === 1
        ? (EVENT_TYPE_OPTIONS.find((option) => option.value === value.eventTypes[0])
            ?.label ?? '1 selected')
        : `${value.eventTypes.length} selected`
  const selectedDaos = React.useMemo(
    () =>
      value.daoKeys
        .map((daoKey) =>
          daos.find((dao) => createDaoKey(dao.chainId, dao.collectionAddress) === daoKey)
        )
        .filter((dao): dao is (typeof daos)[number] => !!dao),
    [daos, value.daoKeys]
  )
  const daoFilterLabel =
    selectedDaos.length === 0
      ? 'All DAOs'
      : selectedDaos.map((dao) => dao.name).join(', ')

  const closeActivityTypeMenu = React.useCallback(
    () => setIsActivityTypeMenuOpen(false),
    []
  )
  useDropdownDismiss({
    isOpen: isActivityTypeMenuOpen,
    onDismiss: closeActivityTypeMenu,
    rootRef: dropdownRef,
    triggerRef: dropdownButtonRef,
  })

  const handleActivityTypeToggle = React.useCallback(
    (eventType: FeedEventType) => {
      const nextEventTypes = selectedEventTypeValues.has(eventType)
        ? value.eventTypes.filter((selectedEventType) => selectedEventType !== eventType)
        : [...value.eventTypes, eventType]

      onChange({
        ...value,
        eventTypes: nextEventTypes,
      })
    },
    [onChange, selectedEventTypeValues, value]
  )

  return (
    <div className={filterBar}>
      <div className={filterHeader}>
        <Flex align="center" gap="x2" wrap>
          <span className={activeDaoFilterHelp}>
            <Text
              as="span"
              className={activeDaoFilterChip}
              tabIndex={0}
              aria-describedby={daoFilterHelpId}
            >
              {daoFilterLabel}
            </Text>
            <span id={daoFilterHelpId} hidden>
              Select DAOs from the sidebar to filter this profile activity by DAO.
            </span>
          </span>
        </Flex>

        <div className={filterRightControls}>
          <label className={filterControl}>
            <Text className={filterLabel}>Activity type</Text>
            <div className={activityTypeDropdown} ref={dropdownRef}>
              <button
                ref={dropdownButtonRef}
                type="button"
                aria-label="Filter profile activity by type"
                aria-expanded={isActivityTypeMenuOpen}
                className={activityTypeDropdownButton}
                onClick={() => setIsActivityTypeMenuOpen((current) => !current)}
              >
                <span>{activityTypeButtonLabel}</span>
                <Icon id="chevron-down" fill="tertiary" pointerEvents="none" />
              </button>
              {isActivityTypeMenuOpen ? (
                <div
                  className={activityTypeDropdownMenu}
                  role="group"
                  aria-label="Activity types"
                >
                  {EVENT_TYPE_OPTIONS.map((option) => {
                    const isSelected = selectedEventTypeValues.has(option.value)

                    return (
                      <label key={option.value} className={activityTypeDropdownOption}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleActivityTypeToggle(option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </label>

          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            disabled={activeFilterCount === 0}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}

import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import { useCallback, useMemo, useState } from 'react'

export interface FeedFilterValues {
  chainIds: CHAIN_ID[]
  daoAddresses: string[]
  eventTypes: FeedEventType[]
  showMemberDaosOnly: boolean
}

export interface UseFeedFiltersOptions {
  initialChainIds?: CHAIN_ID[]
  initialDaoAddresses?: string[]
  initialEventTypes?: FeedEventType[]
  initialShowMemberDaosOnly?: boolean
}

export interface UseFeedFiltersReturn {
  filters: FeedFilterValues
  setChainIds: (chainIds: CHAIN_ID[]) => void
  setDaoAddresses: (daoAddresses: string[]) => void
  setEventTypes: (eventTypes: FeedEventType[]) => void
  setShowMemberDaosOnly: (showMemberDaosOnly: boolean) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}

/**
 * Hook for managing feed filter state
 * @param options - Initial filter values
 */
export function useFeedFilters({
  initialChainIds = [],
  initialDaoAddresses = [],
  initialEventTypes = [],
  initialShowMemberDaosOnly = false,
}: UseFeedFiltersOptions = {}): UseFeedFiltersReturn {
  const [chainIds, setChainIds] = useState<CHAIN_ID[]>(initialChainIds)
  const [daoAddresses, setDaoAddresses] = useState<string[]>(initialDaoAddresses)
  const [eventTypes, setEventTypes] = useState<FeedEventType[]>(initialEventTypes)
  const [showMemberDaosOnly, setShowMemberDaosOnly] = useState<boolean>(
    initialShowMemberDaosOnly
  )

  const filters = useMemo(
    () => ({
      chainIds,
      daoAddresses,
      eventTypes,
      showMemberDaosOnly,
    }),
    [chainIds, daoAddresses, eventTypes, showMemberDaosOnly]
  )

  const resetFilters = useCallback(() => {
    setChainIds(initialChainIds)
    setDaoAddresses(initialDaoAddresses)
    setEventTypes(initialEventTypes)
    setShowMemberDaosOnly(initialShowMemberDaosOnly)
  }, [initialChainIds, initialDaoAddresses, initialEventTypes, initialShowMemberDaosOnly])

  const hasActiveFilters = useMemo(
    () =>
      chainIds.length > 0 ||
      daoAddresses.length > 0 ||
      eventTypes.length > 0 ||
      showMemberDaosOnly,
    [chainIds, daoAddresses, eventTypes, showMemberDaosOnly]
  )

  return {
    filters,
    setChainIds,
    setDaoAddresses,
    setEventTypes,
    setShowMemberDaosOnly,
    resetFilters,
    hasActiveFilters,
  }
}

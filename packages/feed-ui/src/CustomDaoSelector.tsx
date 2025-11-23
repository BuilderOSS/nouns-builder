import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import { useDaoSearch, useUserDaos } from '@buildeross/hooks'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Label, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useMemo, useState } from 'react'

import {
  chip,
  chipRemove,
  daoAddress,
  daoImage,
  daoInfo,
  daoItem,
  daoList,
  daoName,
  emptyState,
  sectionTitle,
  selectButton,
  selectedChips,
  selectorContainer,
} from './CustomDaoSelector.css'
import { SearchInput } from './SearchInput'

export interface CustomDaoSelectorProps {
  chainIds: CHAIN_ID[]
  selectedDaoAddresses: AddressType[]
  onSelectedDaosChange: (addresses: AddressType[]) => void
  userAddress?: AddressType
}

interface DaoListItem {
  name: string
  image: string
  address: AddressType
  chainId: CHAIN_ID
}

export const CustomDaoSelector: React.FC<CustomDaoSelectorProps> = ({
  chainIds,
  selectedDaoAddresses: inputSelectedDaoAddresses,
  onSelectedDaosChange,
  userAddress,
}) => {
  const [searchInput, setSearchInput] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')

  const MIN_SEARCH_LENGTH = 3

  // Ensure lowercase addresses
  const selectedDaoAddresses = useMemo(
    () => inputSelectedDaoAddresses.map((addr) => addr.toLowerCase() as AddressType),
    [inputSelectedDaoAddresses]
  )

  // Fetch user's DAOs
  const { daos: memberDaos, isLoading: isLoadingMemberDaos } = useUserDaos({
    address: userAddress,
    enabled: !!userAddress,
  })

  // Convert MyDaosResponse to DaoListItem format
  const memberDaoItems: DaoListItem[] = useMemo(
    () =>
      memberDaos.map((dao) => ({
        name: dao.name,
        image: dao.contractImage,
        address: dao.collectionAddress.toLowerCase() as AddressType,
        chainId: dao.chainId,
      })),
    [memberDaos]
  )

  // Search for DAOs across all chains - only use activeSearchQuery
  const { daos: searchResults, isLoading: isSearching } = useDaoSearch(
    activeSearchQuery,
    {
      enabled: activeSearchQuery.trim().length >= MIN_SEARCH_LENGTH,
      chainIds: chainIds.length > 0 ? chainIds : undefined,
    }
  )

  // Convert search results to DaoListItem format
  const searchDaoItems: DaoListItem[] = useMemo(
    () =>
      searchResults.map((result) => ({
        name: result.dao.name,
        image: result.token?.image || '',
        address: result.dao.tokenAddress.toLowerCase() as AddressType,
        chainId: result.chainId,
      })),
    [searchResults]
  )

  // Get selected DAO details for chips
  const selectedDaos = useMemo(() => {
    const allDaos = [...memberDaoItems, ...searchDaoItems]
    return selectedDaoAddresses
      .map((addr) => allDaos.find((dao) => dao.address === addr.toLowerCase()))
      .filter((dao): dao is DaoListItem => dao !== undefined)
  }, [selectedDaoAddresses, memberDaoItems, searchDaoItems])

  const toggleDao = useCallback(
    (address: string) => {
      const normalized = address.toLowerCase() as AddressType
      if (selectedDaoAddresses.includes(normalized)) {
        onSelectedDaosChange(selectedDaoAddresses.filter((addr) => addr !== normalized))
      } else {
        onSelectedDaosChange([...selectedDaoAddresses, normalized])
      }
    },
    [selectedDaoAddresses, onSelectedDaosChange]
  )

  const removeDao = useCallback(
    (address: string) => {
      onSelectedDaosChange(
        selectedDaoAddresses.filter((addr) => addr !== address.toLowerCase())
      )
    },
    [selectedDaoAddresses, onSelectedDaosChange]
  )

  // Handle search execution
  const handleSearch = useCallback(() => {
    const trimmedInput = searchInput.trim()
    if (trimmedInput.length >= MIN_SEARCH_LENGTH) {
      setActiveSearchQuery(trimmedInput)
    } else {
      setActiveSearchQuery('')
    }
  }, [searchInput, MIN_SEARCH_LENGTH])

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setActiveSearchQuery('')
  }, [])

  // NEW: select all of the user's DAOs
  const selectAllMemberDaos = useCallback(() => {
    const memberAddresses = memberDaoItems.map(
      (dao) => dao.address.toLowerCase() as AddressType
    )
    const merged = Array.from(new Set([...selectedDaoAddresses, ...memberAddresses]))
    onSelectedDaosChange(merged)
  }, [memberDaoItems, selectedDaoAddresses, onSelectedDaosChange])

  const daosToDisplay = useMemo(() => {
    if (activeSearchQuery.trim().length >= MIN_SEARCH_LENGTH) {
      return searchDaoItems
    }
    return memberDaoItems
  }, [activeSearchQuery, searchDaoItems, memberDaoItems, MIN_SEARCH_LENGTH])

  const showEmptyState =
    !isSearching &&
    !isLoadingMemberDaos &&
    daosToDisplay.length === 0 &&
    activeSearchQuery.trim().length >= MIN_SEARCH_LENGTH

  const showMemberDaosSection =
    activeSearchQuery.trim().length < MIN_SEARCH_LENGTH && memberDaos.length > 0

  // Helpful: check if all member DAOs are already selected (to disable the button)
  const allMemberSelected = useMemo(() => {
    if (!memberDaoItems.length) return false
    const selectedSet = new Set(selectedDaoAddresses)
    return memberDaoItems.every((dao) =>
      selectedSet.has(dao.address.toLowerCase() as AddressType)
    )
  }, [memberDaoItems, selectedDaoAddresses])

  return (
    <Stack className={selectorContainer}>
      {/* Selected DAOs chips */}
      {selectedDaos.length > 0 && (
        <div className={selectedChips}>
          {selectedDaos.map((dao) => (
            <div key={dao.address} className={chip}>
              <FallbackImage
                src={dao.image}
                alt={dao.name}
                width={16}
                height={16}
                style={{ borderRadius: '2px' }}
              />
              <Text fontSize="12">{dao.name}</Text>
              <div className={chipRemove} onClick={() => removeDao(dao.address)}>
                <Text fontSize="12">×</Text>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <SearchInput
        id="dao-search"
        placeholder="Search DAOs..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        showClear={searchInput.trim().length > 0}
        minSearchLength={MIN_SEARCH_LENGTH}
        isLoading={isSearching}
      />

      {/* DAO list */}
      <div className={daoList}>
        {showMemberDaosSection && (
          <>
            <Stack
              direction="row"
              align="center"
              justify="space-between"
              style={{ marginBottom: 8 }}
            >
              <Text className={sectionTitle}>My DAOs</Text>
              <button
                type="button"
                className={selectButton}
                onClick={selectAllMemberDaos}
                disabled={
                  isLoadingMemberDaos || !memberDaoItems.length || allMemberSelected
                }
              >
                {allMemberSelected ? 'All selected' : 'Select all'}
              </button>
            </Stack>
          </>
        )}

        {daosToDisplay.map((dao) => {
          const isSelected = selectedDaoAddresses.includes(
            dao.address.toLowerCase() as AddressType
          )
          const chain = PUBLIC_DEFAULT_CHAINS.find((c) => c.id === dao.chainId)

          return (
            <Label
              key={dao.address}
              className={daoItem}
              onClick={() => toggleDao(dao.address)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleDao(dao.address)}
                onClick={(e) => e.stopPropagation()}
              />
              <FallbackImage
                src={dao.image}
                alt={dao.name}
                width={32}
                height={32}
                className={daoImage}
              />
              <div className={daoInfo}>
                <Text className={daoName}>{dao.name}</Text>
                <Text className={daoAddress}>
                  {dao.address.slice(0, 6)}...{dao.address.slice(-4)}
                  {chain && ` • ${chain.name}`}
                </Text>
              </div>
            </Label>
          )
        })}

        {isSearching && <Text className={emptyState}>Searching...</Text>}
        {isLoadingMemberDaos && activeSearchQuery.trim().length < MIN_SEARCH_LENGTH && (
          <Text className={emptyState}>Loading your DAOs...</Text>
        )}
        {showEmptyState && <Text className={emptyState}>No DAOs found</Text>}
      </div>
    </Stack>
  )
}

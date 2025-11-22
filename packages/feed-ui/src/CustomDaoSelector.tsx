import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import { useDaoSearch, useUserDaos } from '@buildeross/hooks'
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
  searchInput,
  sectionTitle,
  selectButton,
  selectedChips,
  selectorContainer,
} from './CustomDaoSelector.css'

export interface CustomDaoSelectorProps {
  selectedDaoAddresses: string[]
  onSelectedDaosChange: (addresses: string[]) => void
  userAddress?: string
}

interface DaoListItem {
  name: string
  image: string
  address: string
  chainId: number
}

export const CustomDaoSelector: React.FC<CustomDaoSelectorProps> = ({
  selectedDaoAddresses,
  onSelectedDaosChange,
  userAddress,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch user's DAOs
  const { daos: memberDaos, isLoading: isLoadingMemberDaos } = useUserDaos({
    address: userAddress,
    enabled: !!userAddress,
  })

  // Search for DAOs across all chains
  const { daos: searchResults, isLoading: isSearching } = useDaoSearch(searchQuery, {
    enabled: searchQuery.trim().length > 0,
  })

  // Convert MyDaosResponse to DaoListItem format
  const memberDaoItems: DaoListItem[] = useMemo(
    () =>
      memberDaos.map((dao) => ({
        name: dao.name,
        image: dao.contractImage,
        address: dao.collectionAddress.toLowerCase(),
        chainId: dao.chainId,
      })),
    [memberDaos]
  )

  // Convert search results to DaoListItem format
  const searchDaoItems: DaoListItem[] = useMemo(
    () =>
      searchResults.map((result) => ({
        name: result.dao.name,
        image: result.token?.image || '',
        address: result.dao.tokenAddress.toLowerCase(),
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
      const normalized = address.toLowerCase()
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

  // NEW: select all of the user's DAOs
  const selectAllMemberDaos = useCallback(() => {
    const memberAddresses = memberDaoItems.map((dao) => dao.address.toLowerCase())
    const merged = Array.from(
      new Set([...selectedDaoAddresses.map((a) => a.toLowerCase()), ...memberAddresses])
    )
    onSelectedDaosChange(merged)
  }, [memberDaoItems, selectedDaoAddresses, onSelectedDaosChange])

  const daosToDisplay = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      return searchDaoItems.filter(
        (dao) => !selectedDaoAddresses.includes(dao.address.toLowerCase())
      )
    }
    return memberDaoItems.filter(
      (dao) => !selectedDaoAddresses.includes(dao.address.toLowerCase())
    )
  }, [searchQuery, searchDaoItems, memberDaoItems, selectedDaoAddresses])

  const showEmptyState =
    !isSearching &&
    !isLoadingMemberDaos &&
    daosToDisplay.length === 0 &&
    searchQuery.trim().length > 0

  const showMemberDaosSection = searchQuery.trim().length === 0 && memberDaos.length > 0

  // Helpful: check if all member DAOs are already selected (to disable the button)
  const allMemberSelected = useMemo(() => {
    if (!memberDaoItems.length) return false
    const selectedSet = new Set(selectedDaoAddresses.map((a) => a.toLowerCase()))
    return memberDaoItems.every((dao) => selectedSet.has(dao.address.toLowerCase()))
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
      <input
        type="text"
        placeholder="Search DAOs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={searchInput}
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
          const isSelected = selectedDaoAddresses.includes(dao.address.toLowerCase())
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
        {isLoadingMemberDaos && searchQuery.trim().length === 0 && (
          <Text className={emptyState}>Loading your DAOs...</Text>
        )}
        {showEmptyState && <Text className={emptyState}>No DAOs found</Text>}
      </div>
    </Stack>
  )
}

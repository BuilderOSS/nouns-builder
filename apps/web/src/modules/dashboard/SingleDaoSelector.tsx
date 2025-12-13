import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import { SearchInput } from '@buildeross/feed-ui'
import { useDaoSearch, useUserDaos } from '@buildeross/hooks'
import type {
  AddressType,
  CHAIN_ID,
  RequiredDaoContractAddresses,
} from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Button, Flex, Label, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useMemo, useState } from 'react'

import {
  daoAddress,
  daoImage,
  daoInfo,
  daoItem,
  daoList,
  emptyState,
  sectionTitle,
  selectorContainer,
} from './SingleDaoSelector.css'

export interface DaoListItem {
  name: string
  image: string
  address: AddressType
  addresses: RequiredDaoContractAddresses
  chainId: CHAIN_ID
}

export interface SingleDaoSelectorProps {
  chainIds?: CHAIN_ID[]
  selectedDaoAddress?: AddressType
  onSelectedDaoChange: (dao: DaoListItem | undefined) => void
  userAddress?: AddressType
  showSearch?: boolean
}

const MIN_SEARCH_LENGTH = 3

export const SingleDaoSelector: React.FC<SingleDaoSelectorProps> = ({
  chainIds,
  selectedDaoAddress,
  onSelectedDaoChange,
  userAddress,
  showSearch = false,
}) => {
  const [searchInput, setSearchInput] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')

  // Fetch user's DAOs
  const { daos: memberDaos, isLoading: isLoadingMemberDaos } = useUserDaos({
    address: userAddress,
    enabled: !!userAddress,
  })

  // Search for DAOs across all chains - only use activeSearchQuery
  const { daos: searchResults, isLoading: isSearching } = useDaoSearch(
    activeSearchQuery,
    {
      enabled: showSearch && activeSearchQuery.trim().length >= MIN_SEARCH_LENGTH,
      chainIds: chainIds && chainIds.length > 0 ? chainIds : undefined,
    }
  )

  // Convert MyDaosResponse to DaoListItem format
  const memberDaoItems: DaoListItem[] = useMemo(() => {
    let items = memberDaos.map((dao) => ({
      name: dao.name,
      image: dao.contractImage,
      address: dao.collectionAddress.toLowerCase() as AddressType,
      addresses: {
        token: dao.collectionAddress.toLowerCase() as AddressType,
        treasury: dao.treasuryAddress.toLowerCase() as AddressType,
        auction: dao.auctionAddress.toLowerCase() as AddressType,
        governor: dao.governorAddress.toLowerCase() as AddressType,
        metadata: dao.metadataAddress.toLowerCase() as AddressType,
      },
      chainId: dao.chainId,
    }))

    // Filter by chainIds if provided
    if (chainIds && chainIds.length > 0) {
      items = items.filter((dao) => chainIds.includes(dao.chainId))
    }

    return items
  }, [memberDaos, chainIds])

  // Convert search results to DaoListItem format
  const searchDaoItems: DaoListItem[] = useMemo(
    () =>
      searchResults.map((result) => ({
        name: result.dao.name,
        image: result.token?.image || '',
        address: result.dao.tokenAddress.toLowerCase() as AddressType,
        addresses: {
          token: result.dao.tokenAddress.toLowerCase() as AddressType,
          treasury: result.dao.treasuryAddress.toLowerCase() as AddressType,
          auction: result.dao.auctionAddress.toLowerCase() as AddressType,
          governor: result.dao.governorAddress.toLowerCase() as AddressType,
          metadata: result.dao.metadataAddress.toLowerCase() as AddressType,
        },
        chainId: result.chainId,
      })),
    [searchResults]
  )

  const handleDaoClick = (dao: DaoListItem) => {
    // If clicking the same DAO, deselect it
    if (selectedDaoAddress === dao.address) {
      onSelectedDaoChange(undefined)
    } else {
      onSelectedDaoChange(dao)
    }
  }

  // Handle search execution
  const handleSearch = useCallback(() => {
    const trimmedInput = searchInput.trim()
    if (trimmedInput.length >= MIN_SEARCH_LENGTH) {
      setActiveSearchQuery(trimmedInput)
    } else {
      setActiveSearchQuery('')
    }
  }, [searchInput])

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setActiveSearchQuery('')
  }, [])

  // Determine which DAOs to display
  const daosToDisplay = useMemo(() => {
    if (showSearch && activeSearchQuery.trim().length >= MIN_SEARCH_LENGTH) {
      return searchDaoItems
    }
    return memberDaoItems
  }, [showSearch, activeSearchQuery, searchDaoItems, memberDaoItems])

  const showEmptyState =
    !isSearching && !isLoadingMemberDaos && daosToDisplay.length === 0

  const showMemberDaosSection =
    !showSearch || activeSearchQuery.trim().length < MIN_SEARCH_LENGTH

  return (
    <Stack className={selectorContainer} gap="x6">
      {/* Search input - only show if showSearch is true */}
      {showSearch && (
        <Stack gap="x4">
          <SearchInput
            id="dao-search"
            placeholder="Search DAOs..."
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchInput(e.target.value)
            }
            onSearch={handleSearch}
            onClear={handleClearSearch}
            showClear={searchInput.trim().length > 0}
            minSearchLength={MIN_SEARCH_LENGTH}
            isLoading={isSearching}
          />
          <Flex gap="x2">
            <Button
              onClick={handleSearch}
              disabled={searchInput.trim().length < MIN_SEARCH_LENGTH || isSearching}
              flex="1"
            >
              Search
            </Button>
            <Button
              onClick={handleClearSearch}
              variant="secondary"
              disabled={
                searchInput.trim().length === 0 && activeSearchQuery.trim().length === 0
              }
              flex="1"
            >
              Reset
            </Button>
          </Flex>
        </Stack>
      )}

      {/* DAO list */}
      <div className={daoList}>
        {showMemberDaosSection && (
          <Text className={sectionTitle}>
            {showSearch ? 'Your DAOs' : 'Select a DAO'}
          </Text>
        )}

        {daosToDisplay.map((dao) => {
          const isSelected = selectedDaoAddress === dao.address
          const chain = PUBLIC_DEFAULT_CHAINS.find((c) => c.id === dao.chainId)

          return (
            <Label
              key={`${dao.address}-${dao.chainId}`}
              className={daoItem}
              onClick={() => handleDaoClick(dao)}
            >
              <input
                type="radio"
                checked={isSelected}
                onChange={() => handleDaoClick(dao)}
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
                <Text className={daoAddress} fontSize="14" fontWeight="label">
                  {dao.name}
                </Text>
                <Text fontSize="12" color="text3">
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
        {showEmptyState && (
          <Text className={emptyState}>
            {activeSearchQuery.trim().length >= MIN_SEARCH_LENGTH
              ? 'No DAOs found'
              : chainIds && chainIds.length > 0
                ? 'No DAOs found on selected chains'
                : "You don't have any DAOs yet"}
          </Text>
        )}
      </div>
    </Stack>
  )
}

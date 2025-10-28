import { DaoCard } from '@buildeross/dao-ui'
import { useDaoSearch, useExplore } from '@buildeross/hooks'
import { useChainStore } from '@buildeross/stores'
import { Pagination } from '@buildeross/ui/Pagination'
import { Box, Grid, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React, { useCallback, useState } from 'react'
import { formatEther } from 'viem'

import { exploreGrid, searchContainer } from './Explore.css'
import { ExploreNoDaos } from './ExploreNoDaos'
import { ExploreSkeleton } from './ExploreSkeleton'
import { ExploreToolbar } from './ExploreToolbar'
import { SearchInput } from './SearchInput'

const MIN_SEARCH_LENGTH = 3

export const Explore: React.FC = () => {
  const {
    query: { page, orderBy },
    isReady,
  } = useRouter()
  const chain = useChainStore((x) => x.chain)
  const [searchInput, setSearchInput] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')

  // Determine if we're in search mode
  const isSearching = activeSearchQuery.trim().length >= MIN_SEARCH_LENGTH

  // Search hook for DAO search functionality
  const {
    daos: searchDaos,
    isLoading: isSearchLoading,
    isEmpty: isSearchEmpty,
  } = useDaoSearch(activeSearchQuery, chain.slug, { enabled: isSearching })

  // Handle search execution
  const handleSearch = useCallback(() => {
    if (searchInput.trim().length >= MIN_SEARCH_LENGTH) {
      setActiveSearchQuery(searchInput.trim())
    } else {
      setActiveSearchQuery('')
    }
  }, [searchInput])

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setActiveSearchQuery('')
  }, [])

  // Regular explore data when not searching
  const {
    daos: exploreDaos,
    hasNextPage,
    isLoading: isExploreLoading,
  } = useExplore({
    page,
    orderBy,
    chainSlug: chain.slug,
    enabled: isReady && !isSearching,
  })

  // Use search results if searching, otherwise use regular explore data
  const displayDaos = isSearching ? searchDaos : exploreDaos
  const isLoading = isSearching ? isSearchLoading : isExploreLoading

  return (
    <>
      <ExploreToolbar title={`DAOs on ${chain.name}`} showSort={!isSearching} />

      {/* Search Bar */}
      <Box className={searchContainer} mb="x8">
        <SearchInput
          id="search"
          placeholder={`Search DAOs... (min ${MIN_SEARCH_LENGTH} characters)`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          showClear={searchInput.trim().length > 0}
          minSearchLength={MIN_SEARCH_LENGTH}
          isLoading={isSearchLoading}
        />
      </Box>

      {/* Search Results or Empty State */}
      {isSearching && !isSearchLoading && isSearchEmpty && searchDaos !== undefined && (
        <Text
          style={{ maxWidth: 912, minHeight: 250, padding: '150px 0px' }}
          variant={'paragraph-md'}
          color={'tertiary'}
        >
          No DAOs found for "{activeSearchQuery}"
        </Text>
      )}

      {/* DAO Grid */}
      {displayDaos?.length ? (
        <>
          <Grid className={exploreGrid}>
            {displayDaos?.map((dao) => {
              const bid = dao.highestBid?.amount ?? undefined
              const bidInEth = bid ? formatEther(bid) : undefined

              return (
                <DaoCard
                  chainId={chain.id}
                  key={dao.dao.tokenAddress}
                  tokenId={dao.token?.tokenId ?? undefined}
                  tokenImage={dao.token?.image ?? undefined}
                  tokenName={dao.token?.name ?? undefined}
                  collectionName={dao.dao.name ?? undefined}
                  collectionAddress={dao.dao.tokenAddress}
                  bid={bidInEth}
                  endTime={dao.endTime ?? undefined}
                />
              )
            })}
          </Grid>
          {!isSearching && <Pagination hasNextPage={hasNextPage} scroll={true} />}
        </>
      ) : isLoading ? (
        <ExploreSkeleton />
      ) : !page && !isSearching ? (
        <ExploreNoDaos />
      ) : !isSearching ? (
        <>
          <Text
            style={{ maxWidth: 912, minHeight: 250, padding: '150px 0px' }}
            variant={'paragraph-md'}
            color={'tertiary'}
          >
            There are no DAOs here
          </Text>

          <Pagination hasNextPage={hasNextPage} />
        </>
      ) : null}
    </>
  )
}

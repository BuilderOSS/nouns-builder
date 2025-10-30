import { DaoCard } from '@buildeross/dao-ui'
import { useDaoSearch, useExplore } from '@buildeross/hooks'
import { useChainStore } from '@buildeross/stores'
import { Pagination } from '@buildeross/ui/Pagination'
import { Box, Grid, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import { formatEther } from 'viem'

import { exploreGrid, searchContainer } from './Explore.css'
import { ExploreNoDaos } from './ExploreNoDaos'
import { ExploreSkeleton } from './ExploreSkeleton'
import { ExploreToolbar } from './ExploreToolbar'
import { SearchInput } from './SearchInput'

const MIN_SEARCH_LENGTH = 3

export const Explore: React.FC = () => {
  const router = useRouter()
  const {
    query: { page: urlPage, orderBy: urlOrderBy, search: urlSearch },
    isReady,
  } = router
  const page = Array.isArray(urlPage) ? urlPage[0] : urlPage
  const orderBy = Array.isArray(urlOrderBy) ? urlOrderBy[0] : urlOrderBy
  const chain = useChainStore((x) => x.chain)
  const [searchInput, setSearchInput] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')

  // Sync search input with URL parameter on mount
  useEffect(() => {
    if (isReady && urlSearch && typeof urlSearch === 'string') {
      if (urlSearch.trim().length >= MIN_SEARCH_LENGTH) {
        setSearchInput(urlSearch)
        setActiveSearchQuery(urlSearch)
      } else {
        // If URL search is less than minimum, clear it from URL
        const nextQuery = {
          ...router.query,
        }
        delete nextQuery.search
        router.replace(
          {
            pathname: router.pathname,
            query: nextQuery,
          },
          undefined,
          { shallow: true }
        )
      }
    }
  }, [isReady, urlSearch, router])

  // Determine if we're in search mode
  const isSearching = activeSearchQuery.trim().length >= MIN_SEARCH_LENGTH

  // Search hook for DAO search functionality with pagination
  const {
    daos: searchDaos,
    isLoading: isSearchLoading,
    isEmpty: isSearchEmpty,
    hasNextPage: hasSearchNextPage,
    error: searchError,
  } = useDaoSearch(activeSearchQuery, chain.slug, {
    enabled: isSearching,
    page: isSearching ? page : undefined,
  })

  // Handle search execution
  const handleSearch = useCallback(() => {
    const trimmedInput = searchInput.trim()
    if (trimmedInput.length >= MIN_SEARCH_LENGTH) {
      setActiveSearchQuery(trimmedInput)
      // Update URL with search query and reset to page 1
      const nextQuery = { ...router.query }
      nextQuery.search = trimmedInput
      delete nextQuery.page
      router.push(
        {
          pathname: router.pathname,
          query: nextQuery,
        },
        undefined,
        { shallow: true }
      )
    } else {
      setActiveSearchQuery('')
      // Remove search from URL
      const nextQuery = {
        ...router.query,
      }
      delete nextQuery.search
      router.push(
        {
          pathname: router.pathname,
          query: nextQuery,
        },
        undefined,
        { shallow: true }
      )
    }
  }, [searchInput, router])

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setActiveSearchQuery('')
    // Remove search from URL
    const nextQuery = {
      ...router.query,
    }
    delete nextQuery.search
    router.push(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true }
    )
  }, [router])

  // Regular explore data when not searching
  const {
    daos: exploreDaos,
    hasNextPage,
    isLoading: isExploreLoading,
    error: exploreError,
  } = useExplore({
    page,
    orderBy,
    chainSlug: chain.slug,
    enabled: isReady && !isSearching,
  })

  // Use search results if searching, otherwise use regular explore data
  const displayDaos = isSearching ? searchDaos : exploreDaos
  const isLoading = isSearching ? isSearchLoading : isExploreLoading
  const hasNextPageForDisplay = isSearching ? hasSearchNextPage : hasNextPage
  const error = isSearching ? searchError : exploreError

  return (
    <>
      <ExploreToolbar title={`DAOs on ${chain.name}`} showSort={!isSearching} />

      {/* Search Bar */}
      <Box className={searchContainer} mb="x8">
        <SearchInput
          id="search"
          placeholder="Search DAOs..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          showClear={searchInput.trim().length > 0}
          minSearchLength={MIN_SEARCH_LENGTH}
          isLoading={isSearchLoading}
        />
      </Box>

      {/* Error State */}
      {error ? (
        <Text
          style={{ maxWidth: 912, minHeight: 250, padding: '150px 0px' }}
          variant={'paragraph-md'}
          color={'negative'}
        >
          Error while loading DAOs
        </Text>
      ) : (
        <>
          {/* Search Results or Empty State */}
          {isSearching &&
            !isSearchLoading &&
            isSearchEmpty &&
            searchDaos !== undefined && (
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
              <Pagination hasNextPage={hasNextPageForDisplay} scroll={true} />
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

              <Pagination hasNextPage={hasNextPageForDisplay} />
            </>
          ) : null}
        </>
      )}
    </>
  )
}

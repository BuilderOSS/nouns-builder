import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { DaoCard } from '@buildeross/dao-ui'
import { useDaoSearch } from '@buildeross/hooks'
import { ExploreDaosResponse } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { TextInput } from '@buildeross/ui/Fields'
import { Pagination } from '@buildeross/ui/Pagination'
import { Box, Grid, Text } from '@buildeross/zord'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { Fragment, useState } from 'react'
import useSWR from 'swr'
import { formatEther } from 'viem'

import { exploreGrid, searchContainer } from './Explore.css'
import ExploreNoDaos from './ExploreNoDaos'
import { ExploreSkeleton } from './ExploreSkeleton'
import ExploreToolbar from './ExploreToolbar'

export const Explore: React.FC = () => {
  const {
    query: { page, orderBy },
    isReady,
  } = useRouter()
  const chain = useChainStore((x) => x.chain)
  const [searchQuery, setSearchQuery] = useState('')

  // Search hook for DAO search functionality
  const {
    daos: searchDaos,
    isLoading: isSearchLoading,
    isEmpty: isSearchEmpty,
  } = useDaoSearch(searchQuery, chain.slug, { enabled: !!searchQuery.trim() })

  // Regular explore data when not searching
  const { data, error } = useSWR(
    isReady && !searchQuery.trim()
      ? ([SWR_KEYS.EXPLORE, page, orderBy, chain.slug] as const)
      : null,
    async ([, _page, _orderBy, _chainSlug]) => {
      const params: any = {}
      if (_page) params['page'] = _page
      if (_orderBy) params['orderBy'] = _orderBy
      if (_chainSlug) params['network'] = _chainSlug

      return await axios
        .get<ExploreDaosResponse>('/api/explore', { params })
        .then((x) => x.data)
    }
  )

  // Use search results if searching, otherwise use regular explore data
  const isSearching = !!searchQuery.trim()
  const displayDaos = isSearching ? searchDaos : data?.daos
  const isLoading = isSearching ? isSearchLoading : !data && !error
  const { hasNextPage = false } = data || {}

  return (
    <Fragment>
      <ExploreToolbar title={`DAOs on ${chain.name}`} showSort={!isSearching} />

      {/* Search Bar */}
      <Box className={searchContainer}>
        <TextInput
          id="search"
          placeholder="Search DAOs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', borderColor: '#F2F2F2' }}
        />
      </Box>

      {/* Search Results or Empty State */}
      {isSearching && isSearchEmpty && !isSearchLoading && (
        <Text
          style={{ maxWidth: 912, minHeight: 250, padding: '150px 0px' }}
          variant={'paragraph-md'}
          color={'tertiary'}
        >
          No DAOs found for "{searchQuery}"
        </Text>
      )}

      {/* DAO Grid */}
      {displayDaos?.length ? (
        <Fragment>
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
        </Fragment>
      ) : isLoading ? (
        <ExploreSkeleton />
      ) : !page && !isSearching ? (
        <ExploreNoDaos />
      ) : !isSearching ? (
        <Fragment>
          <Text
            style={{ maxWidth: 912, minHeight: 250, padding: '150px 0px' }}
            variant={'paragraph-md'}
            color={'tertiary'}
          >
            There are no DAOs here
          </Text>

          <Pagination hasNextPage={hasNextPage} />
        </Fragment>
      ) : null}
    </Fragment>
  )
}

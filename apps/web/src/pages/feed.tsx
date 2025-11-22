import { Feed, FeedFilters } from '@buildeross/feed-ui'
import { useFeedFilters, useUserDaos } from '@buildeross/hooks'
import { AddressType } from '@buildeross/types'
import { Flex, Stack } from '@buildeross/zord'
import React, { useMemo } from 'react'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { useAccount } from 'wagmi'

import { NextPageWithLayout } from './_app'

const FeedPage: NextPageWithLayout = () => {
  const { address } = useAccount()

  // Fetch user's DAOs
  const { daos: memberDaos } = useUserDaos({
    address,
    enabled: !!address,
  })

  // Initialize filter state
  const { filters, setChainIds, setEventTypes, setShowMemberDaosOnly } = useFeedFilters()

  // Compute the final DAO addresses to filter by
  const daoAddresses = useMemo(() => {
    if (!filters.showMemberDaosOnly) return undefined
    return memberDaos.map((dao) => dao.collectionAddress as AddressType)
  }, [filters.showMemberDaosOnly, memberDaos])

  return (
    <Flex direction={'column'} align={'center'} mt={'x5'} minH={'100vh'}>
      <Meta title={'Feed'} type={'website'} path={'/feed'} />

      {/* Filter Controls */}
      <Flex w="100%" justify="center" mb="x4">
        <Stack gap="x3" w="100%" style={{ maxWidth: '480px' }} px="x4">
          <FeedFilters
            chainIds={filters.chainIds}
            eventTypes={filters.eventTypes}
            showMemberDaosOnly={filters.showMemberDaosOnly}
            memberDaos={memberDaos}
            onChainIdsChange={setChainIds}
            onEventTypesChange={setEventTypes}
            onShowMemberDaosOnlyChange={setShowMemberDaosOnly}
          />
        </Stack>
      </Flex>

      {/* Feed */}
      <Feed
        chainIds={filters.chainIds.length > 0 ? filters.chainIds : undefined}
        daos={daoAddresses}
        eventTypes={filters.eventTypes.length > 0 ? filters.eventTypes : undefined}
      />
    </Flex>
  )
}

FeedPage.getLayout = getDefaultLayout

export default FeedPage

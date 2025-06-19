import { Flex, Text } from '@zoralabs/zord'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import useSWR from 'swr'

import Pagination from 'src/components/Pagination'
import { DaoVoter } from 'src/data/subgraph/requests/daoVoters'
import { usePagination } from 'src/hooks/usePagination'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'

import { useDaoStore } from '../../stores'
import { MemberCard } from './MemberListCard'
import { MemberCardSkeleton, MembersPanel } from './MembersListLayout'

type MembersQuery = {
  membersList: DaoVoter[]
}

export const MembersList = ({
  totalSupply,
  ownerCount,
}: {
  totalSupply?: number
  ownerCount?: number
}) => {
  const { query, isReady } = useRouter()
  const chain = useChainStore((x) => x.chain)
  const {
    addresses: { token },
  } = useDaoStore()
  const { isMobile } = useLayoutStore()
  const LIMIT = 10

  const {
    data: members,
    error,
    isValidating,
  } = useSWR(isReady ? [token, chain.id, query.page] : null, () =>
    axios
      .get<MembersQuery>(
        `/api/membersList/${token}?chainId=${chain.id}&page=${query.page}&limit=${LIMIT}`
      )
      .then((x) => x.data.membersList)
  )

  const { handlePageBack, handlePageForward } = usePagination(true)

  const hasNextPage = useMemo(() => {
    const totalPages = Math.ceil((ownerCount || 0) / LIMIT)
    const currentPage = Number(query.page) || 1
    return currentPage < totalPages
  }, [ownerCount, query.page])

  if (isValidating) {
    const isInitialPageLoad = !query.page && !members
    return (
      <MembersPanel isMobile={isMobile}>
        {Array.from({ length: isInitialPageLoad ? 5 : 10 }).map((_, i) => (
          <MemberCardSkeleton isMobile={isMobile} key={`memberCardSkeleton-${i}`} />
        ))}
      </MembersPanel>
    )
  }
  if (error)
    return (
      <MembersPanel isMobile={isMobile} tableRuler={false}>
        <Flex minH={'x24'} justify={'center'} align={'center'} direction={'column'}>
          <Text fontSize={20} color={'text3'} fontWeight={'display'} mb={'x3'}>
            Error
          </Text>
          <Text color={'text3'}>{error?.message || 'Unknown Error'}</Text>
        </Flex>
      </MembersPanel>
    )

  return (
    <>
      <MembersPanel isMobile={isMobile}>
        {members?.map((member) => (
          <MemberCard
            key={member.voter}
            member={member}
            totalSupply={totalSupply}
            isMobile={isMobile}
          />
        ))}
      </MembersPanel>
      <Pagination
        onNext={handlePageForward}
        onPrev={handlePageBack}
        isLast={!hasNextPage}
        isFirst={!query.page}
      />
    </>
  )
}

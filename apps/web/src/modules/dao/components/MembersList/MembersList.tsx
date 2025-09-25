import { DaoVoter } from '@buildeross/sdk/subgraph'
import { Button, Flex, Text } from '@buildeross/zord'
import axios from 'axios'
import { useRouter } from 'next/router'
import React from 'react'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import useSWR from 'swr'

import { MemberCard } from './MemberListCard'
import { MemberCardSkeleton, MembersPanel } from './MembersListLayout'

type MembersQuery = {
  membersList: DaoVoter[]
}

export const MembersList = ({ totalSupply }: { totalSupply?: number }) => {
  const { isReady } = useRouter()
  const chain = useChainStore((x) => x.chain)
  const {
    addresses: { token },
  } = useDaoStore()

  const {
    data: members,
    error,
    isValidating,
  } = useSWR(
    isReady && token && chain?.id ? [token, chain.id] : null,
    () =>
      axios
        .get<MembersQuery>(`/api/membersList/${token}?chainId=${chain.id}`)
        .then((x) => x.data.membersList),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 60 seconds
    }
  )

  const exportDelegatesToCSV = async () => {
    try {
      const response = await axios.get<{
        delegates: Array<{
          address: string
          tokenCount: number
          tokenIds: string
          dateJoined: string
        }>
      }>(`/api/membersList/${token}/export?chainId=${chain.id}`)

      const delegates = response.data.delegates

      const csvContent = [
        ['Address', 'Token Count', 'Token IDs', 'Date Joined'].join(','),
        ...delegates.map((delegate) =>
          [
            delegate.address,
            delegate.tokenCount,
            delegate.tokenIds,
            delegate.dateJoined,
          ].join(',')
        ),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `delegates.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to export delegates:', error)
    }
  }

  const exportButton = (
    <Button variant="secondary" size="sm" onClick={exportDelegatesToCSV}>
      Export CSV
    </Button>
  )

  if (isValidating) {
    return (
      <MembersPanel exportButton={exportButton}>
        {Array.from({ length: 10 }).map((_, i) => (
          <MemberCardSkeleton key={`memberCardSkeleton-${i}`} />
        ))}
      </MembersPanel>
    )
  }
  if (error)
    return (
      <MembersPanel tableRuler={false} exportButton={exportButton}>
        <Flex minH={'x24'} justify={'center'} align={'center'} direction={'column'}>
          <Text fontSize={20} color={'text3'} fontWeight={'display'} mb={'x3'}>
            Error
          </Text>
          <Text color={'text3'}>{error?.message || 'Unknown Error'}</Text>
        </Flex>
      </MembersPanel>
    )

  return (
    <MembersPanel exportButton={exportButton}>
      {members?.map((member) => (
        <MemberCard key={member.voter} member={member} totalSupply={totalSupply} />
      ))}
    </MembersPanel>
  )
}

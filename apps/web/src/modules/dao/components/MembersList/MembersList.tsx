import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { DaoVoter } from '@buildeross/sdk/subgraph'
import { Button, Flex, Text } from '@buildeross/zord'
import axios from 'axios'
import React from 'react'
import { useChainStore, useDaoStore } from 'src/stores'
import useSWR from 'swr'

import { MemberCard } from './MemberListCard'
import { MemberCardSkeleton, MembersPanel } from './MembersListLayout'

type MembersQuery = {
  membersList: DaoVoter[]
}

export const MembersList = ({ totalSupply }: { totalSupply?: number }) => {
  const chain = useChainStore((x) => x.chain)
  const { addresses } = useDaoStore()

  const token = addresses?.token

  const {
    data: members,
    error,
    isLoading,
  } = useSWR(
    token && chain?.id ? ([SWR_KEYS.MEMBERS_LIST, token, chain.id] as const) : null,
    ([, _token, _chainId]) =>
      axios
        .get<MembersQuery>(`${BASE_URL}/api/membersList/${_token}?chainId=${_chainId}`, {
          timeout: 10000,
        })
        .then((x) => x.data.membersList),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 60 seconds
    }
  )

  const exportDelegatesToCSV = React.useCallback(() => {
    try {
      if (!members || members.length === 0) throw new Error('No members found')

      const delegates = members.map((member) => ({
        address: member.voter,
        tokenCount: member.tokenCount,
        tokenIds: member.tokens.join(';'),
        dateJoined: new Date(member.timeJoined * 1000).toISOString().split('T')[0],
      }))

      const escapeCsv = (v: unknown) => {
        if (v === null || v === undefined) return ''
        const s = String(v)
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
      }

      const csvContent = [
        ['Address', 'Token Count', 'Token IDs', 'Date Joined'].map(escapeCsv).join(','),
        ...delegates.map((delegate) =>
          [delegate.address, delegate.tokenCount, delegate.tokenIds, delegate.dateJoined]
            .map(escapeCsv)
            .join(',')
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
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export delegates:', error)
    }
  }, [members])

  const exportButton = (
    <Button
      variant="secondary"
      size="sm"
      onClick={exportDelegatesToCSV}
      disabled={!token || !chain?.id || !members || members.length === 0}
    >
      Export CSV
    </Button>
  )

  if (isLoading) {
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

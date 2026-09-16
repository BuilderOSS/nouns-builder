import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { daoActivityRequest, DaoVoter } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Button, Flex, Text } from '@buildeross/zord'
import axios from 'axios'
import React from 'react'
import useSWR from 'swr'

import { MemberCard } from './MemberListCard'
import { MemberCardSkeleton, MembersPanel } from './MembersListLayout'

// Active threshold: 1 month (30 days) in seconds
const ACTIVE_THRESHOLD_SECONDS = 30 * 24 * 60 * 60

type MembersQuery = {
  membersList: DaoVoter[]
}

export const MembersList = ({ totalSupply }: { totalSupply?: number }) => {
  const chain = useChainStore((x) => x.chain)
  const { addresses } = useDaoStore()

  const token = addresses.token

  const {
    data: members,
    error,
    isLoading,
  } = useSWR(
    token && chain.id ? ([SWR_KEYS.MEMBERS_LIST, token, chain.id] as const) : null,
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

  const [showActiveOnly, setShowActiveOnly] = React.useState(false)

  const { data: votingActivity, error: votingActivityError } = useSWR(
    token && chain.id
      ? ([SWR_KEYS.ACTIVE_MEMBERS, chain.id, token, 'recent-proposal-voters', 5] as const)
      : null,
    ([, chainId, collectionAddress, , recentProposalCount]) =>
      daoActivityRequest(chainId, collectionAddress, {
        recentProposalCount,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const recentProposalVoters = React.useMemo(
    () => new Set(votingActivity?.votes.map((vote) => vote.voter.toLowerCase())),
    [votingActivity]
  )

  const daoContractAddresses = React.useMemo(
    () =>
      new Set(
        Object.values(addresses)
          .filter((address): address is NonNullable<typeof address> => !!address)
          .map((address) => address.toLowerCase())
      ),
    [addresses]
  )

  const isActiveMember = React.useCallback(
    (member: DaoVoter) => {
      // DAO infrastructure contracts are never active members.
      if (daoContractAddresses.has(member.voter.toLowerCase())) return false

      const nowSeconds = Math.floor(Date.now() / 1000)
      return (
        member.lastActiveAt >= nowSeconds - ACTIVE_THRESHOLD_SECONDS ||
        recentProposalVoters.has(member.voter.toLowerCase())
      )
    },
    [daoContractAddresses, recentProposalVoters]
  )

  const activeListedMembers = React.useMemo(
    () => members?.filter((member) => isActiveMember(member)),
    [members, isActiveMember]
  )

  const displayedMembers = showActiveOnly ? activeListedMembers : members

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
      disabled={!token || !chain.id || !members || members.length === 0}
    >
      Export CSV
    </Button>
  )

  const filterControl = (
    <Flex align="center" gap="x1" role="group" aria-label="Filter members">
      <Button
        variant={showActiveOnly ? 'ghost' : 'outline'}
        size="sm"
        onClick={() => setShowActiveOnly(false)}
        aria-pressed={!showActiveOnly}
      >
        All{members ? ` (${members.length})` : ''}
      </Button>
      <Button
        variant={showActiveOnly ? 'outline' : 'ghost'}
        size="sm"
        onClick={() => setShowActiveOnly(true)}
        disabled={!activeListedMembers || !votingActivity}
        aria-pressed={showActiveOnly}
      >
        Active
        {activeListedMembers && votingActivity ? ` (${activeListedMembers.length})` : ''}
      </Button>
      {votingActivityError && !votingActivity && (
        <Text role="status">Unable to load voting activity.</Text>
      )}
    </Flex>
  )

  if (isLoading) {
    return (
      <MembersPanel exportButton={exportButton} filterControl={filterControl}>
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
    <MembersPanel exportButton={exportButton} filterControl={filterControl}>
      {displayedMembers && displayedMembers.length === 0 ? (
        <Flex minH={'x24'} justify={'center'} align={'center'}>
          <Text color={'text3'}>
            {showActiveOnly ? 'No active members found.' : 'No members found.'}
          </Text>
        </Flex>
      ) : (
        displayedMembers?.map((member) => (
          <MemberCard
            key={member.voter}
            member={member}
            totalSupply={totalSupply}
            isActive={isActiveMember(member)}
            auctionAddress={addresses.auction}
            treasuryAddress={addresses.treasury}
          />
        ))
      )}
    </MembersPanel>
  )
}

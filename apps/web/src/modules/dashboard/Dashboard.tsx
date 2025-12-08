import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { Feed } from '@buildeross/feed-ui'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { getProposalState, ProposalState } from '@buildeross/sdk/contract'
import {
  CurrentAuctionFragment,
  DaoFragment,
  dashboardRequest,
  ProposalFragment,
} from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { AccordionItem } from '@buildeross/ui/Accordion'
import { DisplayPanel } from '@buildeross/ui/DisplayPanel'
import { Box, Stack, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import { CreateActions } from './CreateActions'
import { DaoAuctionCard } from './DaoAuctionCard'
import { DaoProposals } from './DaoProposals'
import { DashboardLayout } from './DashboardLayout'
import { DashConnect } from './DashConnect'
import { AuctionCardSkeleton, DAOCardSkeleton, ProposalCardSkeleton } from './Skeletons'
import { UserProfileCard } from './UserProfileCard'

const ACTIVE_PROPOSAL_STATES = [
  ProposalState.Pending,
  ProposalState.Active,
  ProposalState.Succeeded,
  ProposalState.Queued,
]

export type DashboardDaoProps = DaoFragment & {
  chainId: CHAIN_ID
  daoImage: string
  auctionConfig: {
    minimumBidIncrement: string
    reservePrice: string
  }
  proposals: (ProposalFragment & {
    state: ProposalState
    votes: {
      voter: string
    }[]
  })[]
  currentAuction?: CurrentAuctionFragment | null
}

const fetchDaoProposalState = async (dao: DashboardDaoProps) => {
  try {
    const proposals = await Promise.all(
      dao.proposals.map(async (proposal) => {
        const proposalState = await getProposalState(
          dao.chainId,
          proposal.dao.governorAddress,
          proposal.proposalId
        )
        return { ...proposal, state: proposalState }
      })
    )
    return {
      ...dao,
      proposals: proposals.filter((proposal) =>
        ACTIVE_PROPOSAL_STATES.includes(proposal.state)
      ),
    }
  } catch (error: any) {
    throw new Error(
      error?.message
        ? `RPC Error: ${error.message}`
        : 'Error fetch Dashboard data from RPC'
    )
  }
}

const fetchDashboardData = async (address: string) => {
  try {
    const userDaos = (await dashboardRequest(address)) as unknown as DashboardDaoProps[]
    if (!userDaos) throw new Error('Dashboard DAO query returned undefined')
    const resolved = await Promise.all(userDaos.map(fetchDaoProposalState))

    return resolved
  } catch (error: any) {
    throw new Error(error?.message || 'Error fetching dashboard data')
  }
}

export type DashboardProps = {
  handleOpenCreateProposal: (chainId: CHAIN_ID, tokenAddress: AddressType) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ handleOpenCreateProposal }) => {
  const { address } = useAccount()
  const { displayName, ensAvatar } = useEnsData(address)

  const {
    data: daos,
    isLoading,
    mutate,
    error,
  } = useSWR(
    address ? ([SWR_KEYS.DASHBOARD, address] as const) : null,
    ([, _address]) => fetchDashboardData(_address),
    { revalidateOnFocus: false }
  )

  const sortedDaos = useMemo(() => {
    if (!daos) return []
    return [...daos].sort((a, b) => {
      const aIndex = PUBLIC_DEFAULT_CHAINS.findIndex((chain) => chain.id === a.chainId)
      const bIndex = PUBLIC_DEFAULT_CHAINS.findIndex((chain) => chain.id === b.chainId)
      return aIndex - bIndex
    })
  }, [daos])

  const auctionCards = useMemo(() => {
    if (!address || !sortedDaos.length) return null

    return sortedDaos.map((dao) => (
      <DaoAuctionCard
        // React diffing wasn't catching new auctions starting, so this
        // long key is to help rerender when new auction starts
        key={`auctionCard:${dao.tokenAddress}:${dao}:${
          dao?.currentAuction?.endTime || 0
        }`}
        {...dao}
        userAddress={address}
        handleMutate={mutate}
      />
    ))
  }, [sortedDaos, address, mutate])

  const hasLiveProposals = useMemo(() => {
    if (!sortedDaos.length) return false
    return sortedDaos.some((dao) => dao.proposals.length)
  }, [sortedDaos])

  const totalProposals = useMemo(() => {
    if (!sortedDaos.length) return 0
    return sortedDaos.reduce((acc, dao) => acc + dao.proposals.length, 0)
  }, [sortedDaos])

  const proposalList = useMemo(() => {
    if (!sortedDaos.length) return null

    if (!hasLiveProposals)
      return (
        <Box
          borderRadius={'curved'}
          borderStyle={'solid'}
          width={'100%'}
          borderWidth={'normal'}
          borderColor={'border'}
          p={'x4'}
        >
          <Text fontSize={14} color={'text3'}>
            No active proposals at the moment.
          </Text>
        </Box>
      )

    return sortedDaos
      .filter((dao) => dao.proposals.length)
      .map((dao) => (
        <DaoProposals
          key={dao.tokenAddress}
          {...dao}
          userAddress={address as AddressType}
          onOpenCreateProposal={handleOpenCreateProposal}
        />
      ))
  }, [sortedDaos, address, handleOpenCreateProposal, hasLiveProposals])

  // Main content - always show Feed
  const mainContent = <Feed enableFilters />

  // Sidebar content - varies by state
  let sidebarContent: React.ReactNode

  if (error) {
    sidebarContent = (
      <Stack gap="x6">
        {address && (
          <>
            <UserProfileCard
              address={address}
              daoCount={0}
              ensName={displayName}
              ensAvatar={ensAvatar}
            />
            <CreateActions userAddress={address} />
          </>
        )}
        <AccordionItem
          title="DAOs"
          summary="Error loading"
          description={
            <DisplayPanel
              title="Error fetching DAOs"
              description={error?.message || 'Unknown error.'}
              compact
            />
          }
          defaultOpen={true}
          titleFontSize={18}
          mb={'x0'}
        />
      </Stack>
    )
  } else if (isLoading) {
    sidebarContent = (
      <Stack gap="x6">
        {address && (
          <>
            <UserProfileCard
              address={address}
              daoCount={0}
              ensName={displayName}
              ensAvatar={ensAvatar}
            />
            <CreateActions userAddress={address} />
          </>
        )}
        <AccordionItem
          title="DAOs"
          summary="Loading..."
          description={
            <Stack gap="x1">
              {Array.from({ length: 3 }).map((_, i) => (
                <AuctionCardSkeleton key={`auctionCardSkeleton:${i}`} />
              ))}
            </Stack>
          }
          defaultOpen={false}
          titleFontSize={18}
          mb={'x0'}
        />
        <AccordionItem
          title="Proposals"
          summary="Loading..."
          description={
            <Stack gap="x1">
              <DAOCardSkeleton />
              {Array.from({ length: 2 }).map((_, i) => (
                <ProposalCardSkeleton key={`daoCardSkeleton:${i}`} />
              ))}
            </Stack>
          }
          defaultOpen={false}
          titleFontSize={18}
          mb={'x0'}
        />
      </Stack>
    )
  } else if (!address) {
    sidebarContent = <DashConnect />
  } else if (!daos?.length) {
    sidebarContent = (
      <Stack gap="x6">
        <UserProfileCard
          address={address}
          daoCount={0}
          ensName={displayName}
          ensAvatar={ensAvatar}
        />
        <CreateActions userAddress={address} />
        <AccordionItem
          title="DAOs"
          summary="0 DAOs"
          description={
            <Text fontSize={14} color="text3">
              It looks like you haven't joined any DAOs yet.
            </Text>
          }
          defaultOpen={false}
          titleFontSize={18}
          mb={'x0'}
        />
      </Stack>
    )
  } else {
    sidebarContent = (
      <Stack gap="x6">
        <UserProfileCard
          address={address}
          daoCount={sortedDaos.length}
          ensName={displayName}
          ensAvatar={ensAvatar}
        />
        <CreateActions userAddress={address} />

        <AccordionItem
          title="DAOs"
          summary={`${sortedDaos.length} DAO${sortedDaos.length !== 1 ? 's' : ''}`}
          description={<Stack gap="x1">{auctionCards}</Stack>}
          defaultOpen={false}
          titleFontSize={18}
          mb={'x0'}
        />

        <AccordionItem
          title="Proposals"
          summary={
            hasLiveProposals
              ? `${totalProposals} active proposal${totalProposals !== 1 ? 's' : ''}`
              : 'No active proposals'
          }
          description={<Stack gap="x1">{proposalList}</Stack>}
          defaultOpen={false}
          titleFontSize={18}
          mb={'x0'}
        />
      </Stack>
    )
  }

  // Get unique chain IDs from user's DAOs
  const userChainIds = useMemo(() => {
    if (!sortedDaos.length) return []
    return Array.from(new Set(sortedDaos.map((dao) => dao.chainId)))
  }, [sortedDaos])

  return (
    <DashboardLayout
      mainContent={mainContent}
      sidebarContent={sidebarContent}
      chainIds={userChainIds}
      address={address}
      ensAvatar={ensAvatar}
    />
  )
}

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
  const { displayName, ensAvatar } = useEnsData(address || '')

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

  const auctionCards = useMemo(() => {
    if (!address || !daos) return null
    return daos.map((dao) => (
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
  }, [daos, address, mutate])

  const proposalList = useMemo(() => {
    if (!daos) return null
    const hasLiveProposals = daos.some((dao) => dao.proposals.length)

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

    return daos
      .filter((dao) => dao.proposals.length)
      .map((dao) => (
        <DaoProposals
          key={dao.tokenAddress}
          {...dao}
          userAddress={address as AddressType}
          onOpenCreateProposal={handleOpenCreateProposal}
        />
      ))
  }, [daos, address, handleOpenCreateProposal])

  // Main content - always show Feed
  const mainContent = <Feed enableFilters />

  // Sidebar content - varies by state
  let sidebarContent: React.ReactNode

  if (error) {
    sidebarContent = (
      <Stack gap="x4">
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
        <Box>
          <Text fontSize={18} fontWeight={'display'} mb={'x3'}>
            DAOs
          </Text>
          <DisplayPanel
            title="Error fetching DAOs"
            description={error?.message || 'Unknown error.'}
          />
        </Box>
      </Stack>
    )
  } else if (isLoading) {
    sidebarContent = (
      <Stack gap="x4">
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
        <Box>
          <Text fontSize={18} fontWeight={'display'} mb={'x3'}>
            DAOs
          </Text>
          {Array.from({ length: 3 }).map((_, i) => (
            <AuctionCardSkeleton key={`auctionCardSkeleton:${i}`} />
          ))}
        </Box>
        <Box>
          <Text fontSize={18} fontWeight={'display'} mb={'x3'}>
            Proposals
          </Text>
          <DAOCardSkeleton />
          {Array.from({ length: 2 }).map((_, i) => (
            <ProposalCardSkeleton key={`daoCardSkeleton:${i}`} />
          ))}
        </Box>
      </Stack>
    )
  } else if (!address) {
    sidebarContent = <DashConnect />
  } else if (!daos?.length) {
    sidebarContent = (
      <Stack gap="x4">
        <UserProfileCard
          address={address}
          daoCount={0}
          ensName={displayName}
          ensAvatar={ensAvatar}
        />
        <CreateActions userAddress={address} />
        <Box>
          <Text fontSize={18} fontWeight={'display'} mb={'x3'}>
            DAOs
          </Text>
          <Text fontSize={14} color="text3">
            It looks like you haven't joined any DAOs yet.
          </Text>
        </Box>
      </Stack>
    )
  } else {
    sidebarContent = (
      <Stack gap="x4">
        <UserProfileCard
          address={address}
          daoCount={daos.length}
          ensName={displayName}
          ensAvatar={ensAvatar}
        />
        <CreateActions userAddress={address} />
        <Box>
          <Text fontSize={18} fontWeight={'display'} mb={'x3'}>
            DAOs
          </Text>
          {auctionCards}
        </Box>
        <Box>
          <Text fontSize={16} fontWeight={'display'} mb={'x3'}>
            Proposals
          </Text>
          {proposalList}
        </Box>
      </Stack>
    )
  }

  // Get unique chain IDs from user's DAOs
  const userChainIds = useMemo(() => {
    if (!daos) return []
    return Array.from(new Set(daos.map((dao) => dao.chainId)))
  }, [daos])

  return (
    <DashboardLayout
      mainContent={mainContent}
      sidebarContent={sidebarContent}
      chainIds={userChainIds}
    />
  )
}

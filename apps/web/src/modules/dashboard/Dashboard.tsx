import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getProposalState, ProposalState } from '@buildeross/sdk/contract'
import {
  CurrentAuctionFragment,
  DaoFragment,
  dashboardRequest,
  ProposalFragment,
} from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { DisplayPanel } from '@buildeross/ui/DisplayPanel'
import { Box, Flex, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import { DaoAuctionCard } from './DaoAuctionCard'
import { DaoFeed } from './DaoFeed'
import { DaoProposals } from './DaoProposals'
import { DashboardLayout, DashPage } from './DashboardLayout'
import { DashConnect } from './DashConnect'
import { AuctionCardSkeleton, DAOCardSkeleton, ProposalCardSkeleton } from './Skeletons'

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

  const { data, error, isLoading, mutate } = useSWR(
    address ? ([SWR_KEYS.DASHBOARD, address] as const) : null,
    ([, _address]) => fetchDashboardData(_address),
    { revalidateOnFocus: false }
  )

  const auctionCards = useMemo(() => {
    if (!address || !data) return null
    return data.map((dao) => (
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
  }, [data, address, mutate])

  const proposalList = useMemo(() => {
    if (!data) return null
    const hasLiveProposals = data.some((dao) => dao.proposals.length)

    if (!hasLiveProposals)
      return (
        <Flex
          borderRadius={'phat'}
          borderStyle={'solid'}
          height={'x32'}
          width={'100%'}
          borderWidth={'normal'}
          borderColor={'border'}
          direction={'column'}
          justify={'center'}
          align={'center'}
        >
          <Text fontSize={20} fontWeight={'display'} mb="x4" color={'text3'}>
            No Active Proposals
          </Text>
          <Text color={'text3'}>
            Currently, none of your DAOs have proposals that are in active, queue, or
            pending states. Check back later!
          </Text>
        </Flex>
      )

    return data
      .filter((dao) => dao.proposals.length)
      .map((dao) => (
        <DaoProposals
          key={dao.tokenAddress}
          {...dao}
          userAddress={address as AddressType}
          onOpenCreateProposal={handleOpenCreateProposal}
        />
      ))
  }, [data, address, handleOpenCreateProposal])

  if (error) {
    return (
      <DashPage>
        <Text fontSize={18} mb={'x6'}>
          Something went wrong.
        </Text>
        <DisplayPanel
          title="Error"
          description={
            error?.message || 'Error fetching display data. Error message not found.'
          }
        />
      </DashPage>
    )
  }
  if (isLoading) {
    return (
      <DashboardLayout
        auctionCards={Array.from({ length: 3 }).map((_, i) => (
          <AuctionCardSkeleton key={`auctionCardSkeleton:${i}`} />
        ))}
        daoProposals={
          <Box>
            <DAOCardSkeleton />
            {Array.from({ length: 2 }).map((_, i) => (
              <ProposalCardSkeleton key={`daoCardSkeleton:${i}`} />
            ))}
          </Box>
        }
      />
    )
  }

  if (!address) {
    return <DashConnect />
  }

  if (!data?.length) {
    return (
      <DashPage>
        <Text fontSize={18}>It looks like you haven’t joined any DAOs yet.</Text>
        <DaoFeed isDashboard />
      </DashPage>
    )
  }

  return <DashboardLayout auctionCards={auctionCards} daoProposals={proposalList} />
}

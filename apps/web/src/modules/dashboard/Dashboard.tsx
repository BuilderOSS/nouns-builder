import SWR_KEYS from '@buildeross/constants/swrKeys'
import { getProposalState, ProposalState } from '@buildeross/sdk/contract'
import { dashboardRequest } from '@buildeross/sdk/subgraph'
import {
  CurrentAuctionFragment,
  DaoFragment,
  ProposalFragment,
} from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Box, Flex, Text } from '@buildeross/zord'
import React, { useMemo, useState } from 'react'
import { DisplayPanel } from 'src/components/DisplayPanel'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import { DaoFeed } from '../dao'
import { DaoAuctionCard } from './DaoAuctionCard'
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

const Dashboard = () => {
  const { address } = useAccount()

  const { data, error, isValidating, mutate } = useSWR(
    [`${SWR_KEYS.DASHBOARD}:${address}`],
    address ? () => fetchDashboardData(address) : null,
    { revalidateOnFocus: false }
  )

  const [mutating, setMutating] = useState(false)

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
        />
      ))
  }, [data, address])

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
  if (isValidating && !mutating) {
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

  const handleMutate = async () => {
    setMutating(true)
    await mutate(() => fetchDashboardData(address))
    setMutating(false)
  }

  return (
    <DashboardLayout
      auctionCards={data.map((dao) => (
        <DaoAuctionCard
          // React diffing wasn't catching new auctions starting, so this
          // long key is to help rerender when new auction starts
          key={`auctionCard:${dao.tokenAddress}:${dao}:${
            dao?.currentAuction?.endTime || 0
          }`}
          {...dao}
          userAddress={address}
          handleMutate={handleMutate}
        />
      ))}
      daoProposals={proposalList}
    />
  )
}

export default Dashboard

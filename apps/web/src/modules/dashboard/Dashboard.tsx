import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { Feed } from '@buildeross/feed-ui'
import {
  type DashboardDaoWithState,
  useDashboardData,
  useEnsData,
} from '@buildeross/hooks'
import { ProposalState } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { AccordionItem } from '@buildeross/ui/Accordion'
import { DisplayPanel } from '@buildeross/ui/DisplayPanel'
import { Box, Stack, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { CreateActions } from './CreateActions'
import { DaoAuctionCard } from './DaoAuctionCard'
import { DaoProposals } from './DaoProposals'
import { DashboardLayout } from './DashboardLayout'
import { DashConnect } from './DashConnect'
import { AuctionCardSkeleton, DAOCardSkeleton, ProposalCardSkeleton } from './Skeletons'
import { UserProfileCard } from './UserProfileCard'

export type DashboardDaoProps = DashboardDaoWithState

export type DashboardProps = {
  handleOpenCreateProposal: (chainId: CHAIN_ID, tokenAddress: AddressType) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ handleOpenCreateProposal }) => {
  const { address } = useAccount()
  const { displayName, ensAvatar } = useEnsData(address)
  const [openAccordion, setOpenAccordion] = React.useState<'daos' | 'proposals' | null>(
    null
  )

  const {
    daos,
    isLoading,
    error,
    refresh: mutate,
  } = useDashboardData({
    address,
    enabled: !!address,
  })

  const sortedDaos = useMemo<DashboardDaoWithState[]>(() => {
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

  const hasProposalsNeedingVote = useMemo(() => {
    if (!sortedDaos.length || !address) return false

    return sortedDaos.some((dao: DashboardDaoWithState) =>
      dao.proposals.some(
        (proposal) =>
          proposal.state === ProposalState.Active &&
          !proposal.votes.some((vote) => vote.voter === address.toLowerCase())
      )
    )
  }, [sortedDaos, address])

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
          titleFontSize={18}
          mb={'x0'}
          isOpen={openAccordion === 'daos'}
          onToggle={() => setOpenAccordion(openAccordion === 'daos' ? null : 'daos')}
        />

        <AccordionItem
          title="Proposals"
          summary={
            hasLiveProposals
              ? `${totalProposals} active proposal${totalProposals !== 1 ? 's' : ''}`
              : 'No active proposals'
          }
          description={<Stack gap="x1">{proposalList}</Stack>}
          titleFontSize={18}
          mb={'x0'}
          showWarning={hasProposalsNeedingVote}
          isOpen={openAccordion === 'proposals'}
          onToggle={() =>
            setOpenAccordion(openAccordion === 'proposals' ? null : 'proposals')
          }
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

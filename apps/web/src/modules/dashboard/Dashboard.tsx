import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { Feed } from '@buildeross/feed-ui'
import {
  type DashboardDaoWithState,
  useDashboardData,
  useEnsData,
} from '@buildeross/hooks'
import { ProposalState } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { AccordionItem } from '@buildeross/ui/Accordion'
import { DisplayPanel } from '@buildeross/ui/DisplayPanel'
import { Box, Button, Stack, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'
import { useDaoListPreferences } from 'src/utils/useDaoListPreferences'
import { useAccount } from 'wagmi'

import { CreateActions } from './CreateActions'
import { DaoAuctionCard } from './DaoAuctionCard'
import { DaoProposals } from './DaoProposals'
import { DashboardLayout } from './DashboardLayout'
import { DashConnect } from './DashConnect'
import { AuctionCardSkeleton, DAOCardSkeleton, ProposalCardSkeleton } from './Skeletons'
import { UserProfileCard } from './UserProfileCard'

export type DashboardDaoProps = DashboardDaoWithState

export const Dashboard: React.FC = () => {
  const { address } = useAccount()
  const { displayName, ensAvatar } = useEnsData(address)
  const [openAccordion, setOpenAccordion] = React.useState<'daos' | 'proposals' | null>(
    null
  )
  const [showHiddenDaos, setShowHiddenDaos] = React.useState(false)
  const { isDaoHidden, sortDaos, groupHiddenDaosLast } = useDaoListPreferences(address)

  const {
    daos,
    isLoading,
    error,
    refresh: mutate,
  } = useDashboardData({
    address,
    enabled: !!address,
  })

  const chainSortedDaos = useMemo<DashboardDaoWithState[]>(() => {
    if (!daos) return []
    return [...daos].sort((a, b) => {
      const aIndex = PUBLIC_DEFAULT_CHAINS.findIndex((chain) => chain.id === a.chainId)
      const bIndex = PUBLIC_DEFAULT_CHAINS.findIndex((chain) => chain.id === b.chainId)
      return aIndex - bIndex
    })
  }, [daos])

  const sortedDaos = useMemo(
    () => {
      const orderedDaos = sortDaos(
        chainSortedDaos,
        (dao) => dao.tokenAddress,
        (dao) => dao.chainId
      )

      return groupHiddenDaosLast(
        orderedDaos,
        (dao) => dao.tokenAddress,
        (dao) => dao.chainId
      )
    },
    [chainSortedDaos, sortDaos, groupHiddenDaosLast]
  )

  const visibleDaos = useMemo(
    () => sortedDaos.filter((dao) => !isDaoHidden(dao.chainId, dao.tokenAddress)),
    [sortedDaos, isDaoHidden]
  )
  const hiddenDaosCount = sortedDaos.length - visibleDaos.length
  const daosForDisplay = useMemo(() => {
    if (showHiddenDaos) {
      return sortedDaos
    }

    return visibleDaos
  }, [showHiddenDaos, sortedDaos, visibleDaos])

  const auctionCards = useMemo(() => {
    if (!address || !daosForDisplay.length) return null

    return daosForDisplay.map((dao) => {
      const isHidden = isDaoHidden(dao.chainId, dao.tokenAddress)
      return (
        <Box key={`auctionCard:${dao.tokenAddress}:${dao?.currentAuction?.endTime || 0}`}>
          <DaoAuctionCard
            {...dao}
            userAddress={address}
            handleMutate={mutate}
            isHidden={isHidden}
          />
        </Box>
      )
    })
  }, [daosForDisplay, address, mutate, isDaoHidden])

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
        />
      ))
  }, [sortedDaos, address, hasLiveProposals])

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
              daoCount={-1}
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
              daoCount={-1}
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
          summary={`${daosForDisplay.length} DAO${daosForDisplay.length !== 1 ? 's' : ''}${
            hiddenDaosCount > 0 ? ` (${hiddenDaosCount} hidden)` : ''
          }`}
          description={
            <Stack gap="x2">
              <Stack gap="x1">{auctionCards}</Stack>
              {hiddenDaosCount > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowHiddenDaos((x) => !x)}
                >
                  {showHiddenDaos
                    ? 'Hide hidden DAOs'
                    : `Show hidden DAOs (${hiddenDaosCount})`}
                </Button>
              )}
            </Stack>
          }
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

  return (
    <DashboardLayout
      mainContent={mainContent}
      sidebarContent={sidebarContent}
      address={address}
      ensAvatar={ensAvatar}
    />
  )
}

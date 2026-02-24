import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useVotes } from '@buildeross/hooks/useVotes'
import { useZoraDrops } from '@buildeross/hooks/useZoraDrops'
import { type ZoraDropFragment } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { TransactionType } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { skeletonAnimation } from '@buildeross/ui/styles'
import { isChainIdSupportedByDroposal } from '@buildeross/utils/droposal'
import { Box, Flex, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { DropCard } from './DropCard'
import {
  createDropBtn,
  dropsContainer,
  dropsGrid,
  emptyState,
  headerSection,
} from './Drops.css'

export type DropsProps = {
  onOpenProposalCreate: () => void
}

export const Drops: React.FC<DropsProps> = ({ onOpenProposalCreate }) => {
  const {
    addresses: { token, governor },
  } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const { address } = useAccount()

  const { createProposal, setTransactionType } = useProposalStore()

  // Check if chain is supported
  const isChainSupported = useMemo(
    () => isChainIdSupportedByDroposal(chain.id),
    [chain.id]
  )

  // Fetch drops data
  const {
    data: drops,
    isLoading: dropsLoading,
    error: dropsError,
  } = useZoraDrops({
    chainId: chain.id,
    collectionAddress: token,
    enabled: isChainSupported,
    first: 100,
  })

  // Get voting threshold for Create Drop button
  const { hasThreshold } = useVotes({
    chainId: chain.id,
    governorAddress: governor,
    signerAddress: address,
    collectionAddress: token,
  })

  // Check if governance is delayed
  const { isGovernanceDelayed } = useDelayedGovernance({
    tokenAddress: token,
    governorAddress: governor,
    chainId: chain.id,
  })

  const handleCreateDrop = () => {
    // Set transaction type to DROPOSAL
    setTransactionType(TransactionType.DROPOSAL)

    // Create proposal with default values
    createProposal({
      title: undefined,
      summary: undefined,
      disabled: false,
      transactions: [],
    })

    // Navigate to proposal creation page
    onOpenProposalCreate()
  }

  if (!isChainSupported) {
    return (
      <Box className={emptyState}>
        <Text variant="paragraph-md">Drops are not supported on this network</Text>
        <Text variant="paragraph-sm" color="text3" mt="x2">
          Switch to a supported network to view and create drops
        </Text>
      </Box>
    )
  }

  if (dropsError) {
    return (
      <Box className={emptyState}>
        <Text variant="paragraph-md" color="negative">
          Error loading drops
        </Text>
        <Text variant="paragraph-sm" color="text3" mt="x2">
          {dropsError.message || 'Please try again later'}
        </Text>
      </Box>
    )
  }

  return (
    <Box className={dropsContainer}>
      {/* Header Section */}
      <Flex className={headerSection} justify="space-between" align="center" width="100%">
        <Text variant="heading-sm" style={{ fontWeight: 800 }}>
          Drops
        </Text>
        <ContractButton
          chainId={chain.id}
          handleClick={handleCreateDrop}
          disabled={isGovernanceDelayed ? true : address ? !hasThreshold : false}
          color="tertiary"
          className={createDropBtn}
        >
          Create Drop
        </ContractButton>
      </Flex>

      {/* Loading State */}
      {dropsLoading ? (
        <Box className={dropsGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Box
              key={index}
              width="100%"
              height="x64"
              borderRadius="curved"
              backgroundColor="background2"
              style={{ animation: skeletonAnimation }}
            />
          ))}
        </Box>
      ) : drops && drops.length > 0 ? (
        <Box className={dropsGrid}>
          {drops.map((drop: ZoraDropFragment) => (
            <DropCard
              key={drop.id}
              chainId={chain.id}
              dropAddress={drop.id as `0x${string}`}
              name={drop.name}
              symbol={drop.symbol}
              imageURI={drop.imageURI}
              editionSize={drop.editionSize}
              createdAt={drop.createdAt}
            />
          ))}
        </Box>
      ) : (
        <Box className={emptyState}>
          <Text variant="paragraph-md">No drops found</Text>
          <Text variant="paragraph-sm" color="text3" mt="x2">
            Create a drop for this DAO to get started
          </Text>
        </Box>
      )}
    </Box>
  )
}

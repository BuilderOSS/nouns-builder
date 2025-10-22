import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { useVotes } from '@buildeross/hooks/useVotes'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import React from 'react'

import { DaoProposalCard } from './DaoProposalCard'
import { DashboardDaoProps } from './Dashboard'
import { daoName } from './dashboard.css'

export const DaoProposals = ({
  daoImage,
  tokenAddress,
  governorAddress,
  name,
  proposals,
  chainId,
  userAddress,
  onOpenCreateProposal,
}: DashboardDaoProps & {
  userAddress?: AddressType
  onOpenCreateProposal?: (chainId: CHAIN_ID, tokenAddress: AddressType) => void
}) => {
  const { getDaoLink } = useLinks()
  const { isGovernanceDelayed, isLoading: isLoadingDelayedGovernance } =
    useDelayedGovernance({
      tokenAddress: tokenAddress,
      governorAddress: governorAddress,
      chainId,
    })

  const { hasThreshold, isLoading: isLoadingVotes } = useVotes({
    chainId,
    governorAddress,
    signerAddress: userAddress,
    collectionAddress: tokenAddress,
  })

  const isLoading = isLoadingDelayedGovernance || isLoadingVotes

  return (
    <Box mb={'x10'}>
      <Flex justify={'space-between'} mb={'x6'} align="center">
        <Link align="center" link={getDaoLink?.(chainId, tokenAddress)}>
          {daoImage ? (
            <Box mr="x4">
              <FallbackImage
                srcList={getFetchableUrls(daoImage)}
                style={{ borderRadius: '12px', objectFit: 'contain' }}
                alt=""
                height={48}
                width={48}
              />
            </Box>
          ) : (
            <Box mr="x4" borderRadius="phat">
              <Avatar address={tokenAddress ?? undefined} size="52" />
            </Box>
          )}
          <Text fontSize={20} fontWeight="label" className={daoName} mr={'x2'}>
            {name}
          </Text>
        </Link>

        {onOpenCreateProposal && (
          <Button
            variant="outline"
            borderRadius="curved"
            size={'sm'}
            disabled={!hasThreshold || isGovernanceDelayed}
            onClick={() => onOpenCreateProposal(chainId, tokenAddress)}
            loading={isLoading}
          >
            Create Proposal
          </Button>
        )}
      </Flex>
      <Box>
        {proposals.map((proposal) => (
          <DaoProposalCard
            key={proposal.proposalNumber}
            userAddress={userAddress}
            chainId={chainId}
            collectionAddress={tokenAddress}
            {...proposal}
          />
        ))}
      </Box>
    </Box>
  )
}

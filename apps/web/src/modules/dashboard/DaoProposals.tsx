import { type DashboardDaoWithState } from '@buildeross/hooks'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { DaoProposalCard } from './DaoProposalCard'
import { daoName } from './dashboard.css'

export const DaoProposals = ({
  contractImage,
  tokenAddress,
  treasuryAddress,
  name,
  proposals,
  chainId,
  userAddress,
  onOpenCreateProposal,
}: DashboardDaoWithState & {
  userAddress?: AddressType
  onOpenCreateProposal?: (chainId: CHAIN_ID, tokenAddress: AddressType) => void
}) => {
  const { getDaoLink } = useLinks()

  return (
    <Box>
      <Flex justify={'space-between'} mb={'x3'} align="center">
        <Link align="center" link={getDaoLink?.(chainId, tokenAddress)}>
          {contractImage ? (
            <Box mr="x2">
              <FallbackImage
                src={contractImage}
                style={{ borderRadius: '8px', objectFit: 'contain' }}
                alt=""
                height={32}
                width={32}
              />
            </Box>
          ) : (
            <Box mr="x2" borderRadius="phat">
              <Avatar address={tokenAddress ?? undefined} size="32" />
            </Box>
          )}
          <Text fontSize={16} fontWeight="label" className={daoName} mr={'x2'}>
            {name}
          </Text>
        </Link>

        {onOpenCreateProposal && (
          <Button
            variant="outline"
            borderRadius="curved"
            size={'sm'}
            onClick={() => onOpenCreateProposal(chainId, tokenAddress)}
          >
            Create Proposal
          </Button>
        )}
      </Flex>
      <Stack gap="x2">
        {proposals.map((proposal) => (
          <DaoProposalCard
            key={proposal.proposalNumber}
            userAddress={userAddress}
            chainId={chainId}
            collectionAddress={tokenAddress}
            treasuryAddress={treasuryAddress}
            daoName={name}
            {...proposal}
          />
        ))}
      </Stack>
    </Box>
  )
}

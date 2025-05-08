import { Box, Button, Flex, Text } from '@zoralabs/zord'
import { getFetchableUrls } from 'ipfs-service'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

import { Avatar } from 'src/components/Avatar'
import { FallbackNextImage } from 'src/components/FallbackImage'
import { PUBLIC_ALL_CHAINS } from 'src/constants/defaultChains'
import { useDelayedGovernance } from 'src/hooks/useDelayedGovernance'
import { AddressType } from 'src/typings'

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
}: DashboardDaoProps & { userAddress?: AddressType }) => {
  const { isGovernanceDelayed } = useDelayedGovernance({
    tokenAddress: tokenAddress,
    governorAddress: governorAddress,
    chainId,
  })

  const router = useRouter()

  const currentChainSlug = PUBLIC_ALL_CHAINS.find((chain) => chain.id === chainId)?.slug

  return (
    <Box mb={'x10'}>
      <Flex justify={'space-between'} mb={'x6'} align="center">
        <Link href={`/dao/${currentChainSlug}/${tokenAddress}`} passHref>
          <Flex align={'center'}>
            {daoImage ? (
              <Box mr="x4">
                <FallbackNextImage
                  srcList={getFetchableUrls(daoImage)}
                  layout="fixed"
                  objectFit="contain"
                  style={{ borderRadius: '12px' }}
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
          </Flex>
        </Link>

        <Button
          variant="outline"
          borderRadius="curved"
          size={'sm'}
          disabled={isGovernanceDelayed}
          onClick={() =>
            router.push(`/dao/${currentChainSlug}/${tokenAddress}/proposal/create`)
          }
        >
          Create Proposal
        </Button>
      </Flex>
      <Box>
        {proposals.map((proposal) => (
          <DaoProposalCard
            key={proposal.proposalNumber}
            {...proposal}
            chainId={chainId}
            currentChainSlug={currentChainSlug}
            tokenAddress={tokenAddress}
            proposalState={proposal.proposalState}
            userAddress={userAddress}
          />
        ))}
      </Box>
    </Box>
  )
}

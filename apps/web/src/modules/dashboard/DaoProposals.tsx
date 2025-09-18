import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useDelayedGovernance } from '@buildeross/hooks/useDelayedGovernance'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { AddressType } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { FallbackNextImage } from 'src/components/FallbackNextImage'

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
            chainId={chainId}
            currentChainSlug={currentChainSlug}
            tokenAddress={tokenAddress}
            userAddress={userAddress}
            {...proposal}
          />
        ))}
      </Box>
    </Box>
  )
}

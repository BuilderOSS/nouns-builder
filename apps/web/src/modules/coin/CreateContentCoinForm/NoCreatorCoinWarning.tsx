import { useDelayedGovernance, useVotes } from '@buildeross/hooks'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { TransactionType } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React from 'react'
import { useAccount } from 'wagmi'

export const NoCreatorCoinWarning: React.FC = () => {
  const router = useRouter()
  const { address: userAddress } = useAccount()
  const { createProposal, setTransactionType } = useProposalStore()

  // Get addresses and chain from stores
  const addresses = useDaoStore((x) => x.addresses)
  const chain = useChainStore((x) => x.chain)
  const chainId = chain.id
  const governor = addresses.governor
  const collectionAddress = addresses.token

  // Get voting threshold for Create Creator Coin button
  const { isOwner, isDelegating, hasThreshold, proposalVotesRequired } = useVotes({
    chainId: chainId,
    governorAddress: governor,
    signerAddress: userAddress,
    collectionAddress: collectionAddress,
  })

  // Check if governance is delayed
  const { isGovernanceDelayed } = useDelayedGovernance({
    tokenAddress: collectionAddress,
    governorAddress: governor,
    chainId: chainId,
  })

  // Handle creating a Creator Coin proposal
  const handleCreateCreatorCoinProposal = () => {
    setTransactionType(TransactionType.CREATOR_COIN)
    createProposal({
      title: undefined,
      summary: undefined,
      disabled: false,
      transactions: [],
    })
    // Navigate to proposal create page
    router.push({
      pathname: '/dao/[network]/[token]/proposal/create',
      query: router.query,
    })
  }

  return (
    <Box w="100%">
      <Box
        p="x6"
        borderRadius="curved"
        borderStyle="solid"
        borderWidth="normal"
        borderColor="warning"
        backgroundColor="background2"
      >
        <Stack gap="x4">
          <Stack gap="x2">
            <Text fontSize="16" fontWeight="label">
              No Creator Coin Found
            </Text>
            <Text fontSize="14" color="text3">
              This DAO needs to create a Creator Coin before publishing posts. Creator
              Coins are used as the base currency for content posts.
            </Text>
          </Stack>

          {/* Helper text and button section */}
          <Flex gap="x2" align="center" wrap="wrap">
            {/* Helper text - desktop only */}
            <Flex
              justify={'flex-start'}
              align={'center'}
              display={{ '@initial': 'none', '@768': 'flex' }}
              gap="x2"
              style={{ flex: 1 }}
            >
              {userAddress && !isDelegating && !isOwner && (
                <Text variant="paragraph-sm" color="text3">
                  You have no votes.
                </Text>
              )}
              {isDelegating && (
                <Text variant="paragraph-sm" color="text3">
                  Your votes are delegated.
                </Text>
              )}
              {isOwner && !hasThreshold && (
                <Text variant="paragraph-sm" color="text3">
                  {Number(proposalVotesRequired)} votes required to propose.
                </Text>
              )}
              {!userAddress && (
                <Text variant="paragraph-sm" color="text3">
                  Connect wallet to create a proposal.
                </Text>
              )}
            </Flex>

            {/* Create Creator Coin Button */}
            {hasThreshold ? (
              <ContractButton
                chainId={chainId}
                handleClick={handleCreateCreatorCoinProposal}
                disabled={isGovernanceDelayed}
                variant="primary"
              >
                Create Creator Coin Proposal
              </ContractButton>
            ) : (
              <Button variant="primary" disabled>
                Create Creator Coin Proposal
              </Button>
            )}
          </Flex>
        </Stack>
      </Box>
    </Box>
  )
}

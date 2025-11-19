import { useDaoMembership, useHasVoted, useVotes } from '@buildeross/hooks'
import { VoteModal } from '@buildeross/proposal-ui'
import {
  type ProposalVoteFragment,
  ProposalVoteSupport as Support,
} from '@buildeross/sdk/subgraph'
import type { BytesType, CHAIN_ID, RequiredDaoContractAddresses } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Atoms, Box, Flex, Icon, IconType, Stack, Text } from '@buildeross/zord'
import React, { ReactNode, useMemo } from 'react'
import { useAccount } from 'wagmi'

export interface VoteModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  proposalId: BytesType
  proposalNumber: string
  proposalTitle: string
  chainId: CHAIN_ID
  addresses: RequiredDaoContractAddresses
  votesAvailable?: number
}

const voteStyleMap: Record<
  Support,
  { iconId: IconType; iconColor: Atoms['color']; text: ReactNode | string }
> = {
  [Support.Against]: {
    iconId: 'cross',
    iconColor: 'negative',
    text: (
      <span>
        You voted <span style={{ color: '#E40003' }}>against</span>
      </span>
    ),
  },
  [Support.For]: {
    iconId: 'check',
    iconColor: 'positive',
    text: (
      <span>
        You voted <span style={{ color: '#1CB687' }}>for</span>
      </span>
    ),
  },
  [Support.Abstain]: {
    iconId: 'dash',
    iconColor: 'tertiary',
    text: 'You abstained from voting',
  },
}

const VoteStatusDisplay: React.FC<{ vote: ProposalVoteFragment }> = ({ vote }) => {
  const voteStyle = voteStyleMap[vote.support]
  const votesString = ` with ${vote.weight} ${vote.weight === 1 ? 'vote' : 'votes'}`

  return (
    <Box p="x4" backgroundColor="background2" borderRadius="curved" mb="x4">
      <Flex direction="row" align="center" gap="x3">
        <Icon
          id={voteStyle.iconId}
          backgroundColor={voteStyle.iconColor}
          borderRadius="round"
          p="x2"
          fill="onAccent"
        />
        <Stack gap="x1">
          <Text fontWeight="display">
            {voteStyle.text}
            {vote.support !== Support.Abstain && votesString}
          </Text>
          {vote.reason && (
            <Text variant="paragraph-sm" color="tertiary" mt="x2">
              Reason: {vote.reason}
            </Text>
          )}
        </Stack>
      </Flex>
    </Box>
  )
}

export const VoteModalWrapper: React.FC<VoteModalWrapperProps> = ({
  isOpen,
  onClose,
  proposalId,
  proposalTitle,
  chainId,
  addresses,
}) => {
  const { address: userAddress } = useAccount()

  const votesData = useVotes({
    chainId,
    collectionAddress: addresses.token,
    governorAddress: addresses.governor,
    signerAddress: userAddress,
    enabled: isOpen,
  })

  const { data: membership, isLoading: isMembershipLoading } = useDaoMembership({
    chainId,
    collectionAddress: addresses.token,
    signerAddress: userAddress,
    enabled: isOpen,
  })

  const {
    vote,
    hasVoted,
    isLoading: isVoteLoading,
  } = useHasVoted({
    chainId,
    proposalId,
    voterAddress: userAddress,
    enabled: isOpen,
  })

  const { votesAvailable, isDelegating, voteDescription } = useMemo(() => {
    const { votes, isDelegating } = votesData
    return {
      votesAvailable: votes ? Number(votes) : 0,
      isDelegating: isDelegating ?? false,
      voteDescription: membership?.voteDescription,
    }
  }, [votesData, membership])

  const isLoading = votesData.isLoading || isVoteLoading || isMembershipLoading

  // Show loading state
  if (isLoading || !isOpen) {
    return (
      <AnimatedModal open={isOpen} size="medium" close={onClose}>
        <Box p="x6">
          <Text>Loading...</Text>
        </Box>
      </AnimatedModal>
    )
  }

  // If user has already voted, show vote status with option to close
  if (hasVoted && vote) {
    return (
      <AnimatedModal open={isOpen} size="medium" close={onClose}>
        <Box p="x6">
          <Text variant="heading-md" mb="x4">
            Your Vote
          </Text>
          <Text variant="paragraph-sm" color="tertiary" mb="x6">
            Proposal: {proposalTitle}
          </Text>
          <VoteStatusDisplay vote={vote} />
          <Text variant="paragraph-sm" color="tertiary" mt="x4">
            You have already voted on this proposal. Your vote has been recorded.
          </Text>
        </Box>
      </AnimatedModal>
    )
  }

  // If user has no votes (not a DAO member)
  if (votesAvailable === 0 && !isDelegating) {
    return (
      <AnimatedModal open={isOpen} size="medium" close={onClose}>
        <Box p="x6">
          <Text variant="heading-md" mb="x4">
            Cannot Vote
          </Text>
          <Text variant="paragraph-sm" color="tertiary" mb="x6">
            Proposal: {proposalTitle}
          </Text>
          <Box p="x4" backgroundColor="background2" borderRadius="curved">
            <Text variant="paragraph-md">
              You are not a member of this DAO. To vote on proposals, you need to hold at
              least one token from this DAO.
            </Text>
          </Box>
        </Box>
      </AnimatedModal>
    )
  }

  // If user has delegated their votes
  if (isDelegating && membership?.delegate) {
    return (
      <AnimatedModal open={isOpen} size="medium" close={onClose}>
        <Box p="x6">
          <Text variant="heading-md" mb="x4">
            Cannot Vote
          </Text>
          <Text variant="paragraph-sm" color="tertiary" mb="x6">
            Proposal: {proposalTitle}
          </Text>

          {voteDescription && (
            <Box mb="x4" color="text3">
              <Text variant="paragraph-sm">{voteDescription}</Text>
            </Box>
          )}

          <Box mb="x2">
            <Text variant="paragraph-md" fontWeight="display">
              Current Delegate
            </Text>
          </Box>

          <Flex
            align="center"
            height="x16"
            mb="x4"
            borderColor="border"
            borderWidth="normal"
            borderStyle="solid"
            borderRadius="curved"
            gap="x4"
            px="x4"
          >
            <Box>
              {membership.delegate.ensAvatar ? (
                <img
                  src={membership.delegate.ensAvatar}
                  alt="avatar"
                  height={28}
                  width={28}
                  style={{ borderRadius: '50%' }}
                />
              ) : (
                <Avatar address={membership.delegate.ethAddress} size="28" />
              )}
            </Box>

            {membership.delegate.ensName ? (
              <>
                <Box>{membership.delegate.ensName}</Box>
                <Box color="text4" ml="auto">
                  {walletSnippet(membership.delegate.ethAddress)}
                </Box>
              </>
            ) : (
              <Box>{walletSnippet(membership.delegate.ethAddress)}</Box>
            )}
          </Flex>

          <Box p="x4" backgroundColor="background2" borderRadius="curved">
            <Text variant="paragraph-sm" color="tertiary">
              To vote on proposals yourself, you need to undelegate your votes first.
            </Text>
          </Box>
        </Box>
      </AnimatedModal>
    )
  }

  // If user hasn't voted and has votes available, show the voting interface
  return (
    <VoteModal
      title={proposalTitle}
      proposalId={proposalId}
      votesAvailable={votesAvailable}
      showVoteModal={isOpen}
      setShowVoteModal={onClose}
      addresses={addresses}
      chainId={chainId}
      onSuccess={onClose}
    />
  )
}

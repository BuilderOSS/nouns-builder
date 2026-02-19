import { useDaoMembership, useHasVoted, useVotes } from '@buildeross/hooks'
import { SubmitVoteForm } from '@buildeross/proposal-ui'
import {
  type ProposalVoteFragment,
  ProposalVoteSupport as Support,
} from '@buildeross/sdk/subgraph'
import type { BytesType, CHAIN_ID, RequiredDaoContractAddresses } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Atoms, Box, Flex, Icon, IconType, Stack, Text } from '@buildeross/zord'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

import { ModalHeader } from './ModalHeader'

export interface VoteModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  proposalId: BytesType
  proposalTitle: string
  proposalTimeCreated: string
  chainId: CHAIN_ID
  addresses: RequiredDaoContractAddresses
  daoName: string
  daoImage: string
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

const AlreadyVotedContent: React.FC<{
  proposalTitle: string
  daoName: string
  daoImage: string
  vote: ProposalVoteFragment
  onClose: () => void
}> = ({ proposalTitle, daoName, daoImage, vote, onClose }) => {
  return (
    <Box>
      <ModalHeader
        daoName={daoName}
        daoImage={daoImage}
        title="Your Vote"
        subtitle={proposalTitle}
        onClose={onClose}
      />
      <VoteStatusDisplay vote={vote} />
      <Text variant="paragraph-sm" color="tertiary" mt="x4">
        You have already voted on this proposal. Your vote has been recorded.
      </Text>
    </Box>
  )
}

const NotAMemberContent: React.FC<{
  proposalTitle: string
  daoName: string
  daoImage: string
  onClose: () => void
}> = ({ proposalTitle, daoName, daoImage, onClose }) => {
  return (
    <Box>
      <ModalHeader
        daoName={daoName}
        daoImage={daoImage}
        title="Cannot Vote"
        subtitle={proposalTitle}
        onClose={onClose}
      />
      <Box p="x4" backgroundColor="background2" borderRadius="curved">
        <Text variant="paragraph-md">
          You are not a member of this DAO. To vote on proposals, you need to hold at
          least one token from this DAO.
        </Text>
      </Box>
    </Box>
  )
}

const DelegatedVotesContent: React.FC<{
  proposalTitle: string
  daoName: string
  daoImage: string
  membership: NonNullable<ReturnType<typeof useDaoMembership>['data']>
  onClose: () => void
}> = ({ proposalTitle, daoName, daoImage, membership, onClose }) => {
  return (
    <Box>
      <ModalHeader
        daoName={daoName}
        daoImage={daoImage}
        title="Cannot Vote"
        subtitle={proposalTitle}
        onClose={onClose}
      />

      {membership.voteDescription && (
        <Box mb="x4" color="text3">
          <Text variant="paragraph-sm">{membership.voteDescription}</Text>
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
  )
}

export const VoteModalWrapper: React.FC<VoteModalWrapperProps> = ({
  isOpen,
  onClose,
  proposalId,
  proposalTitle,
  proposalTimeCreated,
  chainId,
  addresses,
  daoName,
  daoImage,
}) => {
  const { address: userAddress } = useAccount()
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
    }
  }, [])

  const handleClose = () => {
    onClose()
    setIsSuccess(false)

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
  }

  const handleSuccess = () => {
    setIsSuccess(true)
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
    }
    // Auto-close after 2 seconds
    successTimerRef.current = setTimeout(() => {
      handleClose()
    }, 2000)
  }

  const {
    votes,
    isDelegating,
    isLoading: isLoadingVotes,
  } = useVotes({
    chainId,
    collectionAddress: addresses.token,
    governorAddress: addresses.governor,
    signerAddress: userAddress,
    timestamp: BigInt(proposalTimeCreated),
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

  const votesAvailable = votes ? Number(votes) : 0
  const isLoading = isLoadingVotes || isVoteLoading || isMembershipLoading

  // Determine modal size based on state
  const modalSize = isSuccess ? 'small' : 'medium'

  // Render modal content based on state
  const renderContent = () => {
    // Show loading state
    if (isLoading) {
      return (
        <Box>
          <ModalHeader
            daoName={daoName}
            daoImage={daoImage}
            title="Vote on Proposal"
            subtitle={proposalTitle}
            onClose={handleClose}
          />
          <Text>Loading...</Text>
        </Box>
      )
    }

    // Show success state after voting
    if (isSuccess) {
      return (
        <SuccessModalContent
          success={true}
          title={'Vote Submitted'}
          subtitle={`You've successfully voted on this proposal`}
        />
      )
    }

    // User has already voted
    if (hasVoted && vote) {
      return (
        <AlreadyVotedContent
          proposalTitle={proposalTitle}
          daoName={daoName}
          daoImage={daoImage}
          vote={vote}
          onClose={handleClose}
        />
      )
    }

    // User is not in the DAO system at all
    if (!membership) {
      return (
        <NotAMemberContent
          proposalTitle={proposalTitle}
          daoName={daoName}
          daoImage={daoImage}
          onClose={handleClose}
        />
      )
    }

    // User has no voting power available
    if (votesAvailable === 0) {
      // Check if they're actually in the system (own tokens or have votes)
      if (membership.tokenCount > 0 || membership.voteCount > 0) {
        // They're in the system but have delegated their votes
        if (isDelegating && membership.delegate) {
          return (
            <DelegatedVotesContent
              proposalTitle={proposalTitle}
              daoName={daoName}
              daoImage={daoImage}
              membership={membership}
              onClose={handleClose}
            />
          )
        }
      }

      // No votes and not meaningfully in the system - not a member
      return (
        <NotAMemberContent
          proposalTitle={proposalTitle}
          daoName={daoName}
          daoImage={daoImage}
          onClose={handleClose}
        />
      )
    }

    // User has voting power - show the voting interface
    // SubmitVoteForm has its own header/close button, so we wrap it with the DAO header above
    return (
      <Box>
        <ModalHeader
          daoName={daoName}
          daoImage={daoImage}
          title="Vote on Proposal"
          subtitle={proposalTitle}
          onClose={handleClose}
        />
        <SubmitVoteForm
          proposalId={proposalId}
          votesAvailable={votesAvailable}
          handleModalClose={handleClose}
          onSuccess={handleSuccess}
          title={proposalTitle}
          addresses={addresses}
          chainId={chainId}
          hideHeader
        />
      </Box>
    )
  }

  return (
    <AnimatedModal
      key="feed-vote-modal"
      open={isOpen}
      size={modalSize}
      close={handleClose}
    >
      {renderContent()}
    </AnimatedModal>
  )
}

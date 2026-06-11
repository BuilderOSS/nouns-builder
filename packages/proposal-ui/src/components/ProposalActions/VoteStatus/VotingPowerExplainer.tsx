import { useDaoMembership } from '@buildeross/hooks/useDaoMembership'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useVotes } from '@buildeross/hooks/useVotes'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { handleGMTOffset } from '@buildeross/utils/helpers'
import { atoms, Flex, Text, vars } from '@buildeross/zord'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { getVotingPowerCase, VotingPowerCase } from './VotingPowerExplainer.helper'

const VOTING_POWER_DOCS_URL =
  'https://docs.nouns.build/onboarding/governance/#-voting-power'

export interface VotingPowerExplainerProps {
  snapshotVotes: number // votesAvailable computed at the proposal snapshot
  timeCreated: number // proposal.timeCreated (unix seconds) = snapshot timestamp
  daoName?: string
}

export const VotingPowerExplainer: React.FC<VotingPowerExplainerProps> = ({
  snapshotVotes,
  timeCreated,
  daoName,
}) => {
  const { address: userAddress } = useAccount()
  const chain = useChainStore((x) => x.chain)
  const { token, governor } = useDaoStore((x) => x.addresses)
  const { getAuctionLink, getDaoLink } = useLinks()

  const {
    votes: currentVotes,
    isDelegating,
    delegatedTo,
    isLoading: votesLoading,
  } = useVotes({
    chainId: chain.id,
    collectionAddress: token,
    governorAddress: governor,
    signerAddress: userAddress,
  })

  const { data: membership, isLoading: membershipLoading } = useDaoMembership({
    chainId: chain.id,
    collectionAddress: token,
    signerAddress: userAddress,
  })

  const delegateEns = useEnsData(isDelegating ? delegatedTo : undefined)

  const { tokenCount, delegatedVotes } = useMemo(() => {
    const tokenCount = membership?.tokenCount ?? 0
    const ownedVotes =
      Object.entries(membership?.voteDistribution ?? {}).find(
        ([addr]) => addr.toLowerCase() === userAddress?.toLowerCase()
      )?.[1] ?? 0
    const delegatedVotes = Math.max((membership?.voteCount ?? 0) - ownedVotes, 0)

    return { tokenCount, delegatedVotes }
  }, [membership, userAddress])

  const isLoading = votesLoading || (!!userAddress && membershipLoading)

  const votingCase = getVotingPowerCase({
    isConnected: !!userAddress,
    isLoading,
    snapshotVotes,
    currentVotes: Number(currentVotes),
    tokenCount,
    delegatedVotes,
    isDelegating,
  })

  const snapshotDateLabel = `${dayjs
    .unix(Number(timeCreated))
    .format('MMM D, YYYY, h:mm A')} ${handleGMTOffset()}`

  const renderBody = () => {
    switch (votingCase) {
      case VotingPowerCase.Loading:
        return <Text color={'text3'}>Checking your voting power...</Text>

      case VotingPowerCase.NotConnected:
        return (
          <Text color={'text3'}>
            Connect your wallet to see your voting power for this proposal
          </Text>
        )

      case VotingPowerCase.NoTokens:
        return (
          <>
            <Text color={'text3'}>
              You do not hold any {daoName} tokens, so you cannot vote on this proposal.
              Win a token at auction to vote on future proposals.
            </Text>
            {token && (
              <LinkWrapper
                link={getAuctionLink(chain.id, token)}
                color={'text3'}
                className={atoms({ textDecoration: 'underline' })}
              >
                Bid in the current auction
              </LinkWrapper>
            )}
          </>
        )

      case VotingPowerCase.AcquiredAfterSnapshot:
        return (
          <>
            <Text color={'text3'}>
              {Number(currentVotes) > 0 ? (
                <>
                  Voting power for this proposal was snapshotted on {snapshotDateLabel}.
                  You received your {Number(currentVotes)}{' '}
                  {Number(currentVotes) === 1 ? 'vote' : 'votes'} after the snapshot, so{' '}
                  {Number(currentVotes) === 1 ? 'it' : 'they'} cannot be used on this
                  proposal, but {Number(currentVotes) === 1 ? 'it' : 'they'} will count on
                  future proposals.
                </>
              ) : (
                <>
                  Voting power for this proposal was snapshotted on {snapshotDateLabel}.
                  Your voting power was received after the snapshot, so it cannot be used
                  on this proposal.
                </>
              )}
            </Text>
            <LinkWrapper
              link={{ href: VOTING_POWER_DOCS_URL }}
              isExternal
              color={'text3'}
              className={atoms({ textDecoration: 'underline' })}
            >
              Learn more about voting power
            </LinkWrapper>
          </>
        )

      case VotingPowerCase.DelegatedAway:
        return (
          <>
            <Text color={'text3'}>
              Your {tokenCount} {tokenCount === 1 ? 'vote is' : 'votes are'} delegated to{' '}
              {delegateEns.displayName} for this proposal.
            </Text>
            {token && (
              <LinkWrapper
                link={getDaoLink(chain.id, token, 'activity')}
                color={'text3'}
                className={atoms({ textDecoration: 'underline' })}
              >
                Update delegation
              </LinkWrapper>
            )}
          </>
        )

      case VotingPowerCase.CanVote:
        return (
          <Text color={'text3'}>
            You have{' '}
            <strong style={{ color: vars.color.text1 }}>
              {snapshotVotes} {snapshotVotes === 1 ? 'vote' : 'votes'}
            </strong>{' '}
            available for {daoName}
          </Text>
        )

      case VotingPowerCase.CanVoteWithDelegation:
        return (
          <Text color={'text3'}>
            You have{' '}
            <strong style={{ color: vars.color.text1 }}>
              {snapshotVotes} {snapshotVotes === 1 ? 'vote' : 'votes'}
            </strong>{' '}
            available for {daoName}, including {delegatedVotes} delegated to you by other
            members
          </Text>
        )

      default:
        return null
    }
  }

  return (
    <Flex
      direction={'column'}
      gap={'x1'}
      textAlign={{ '@initial': 'center', '@768': 'left' }}
    >
      {renderBody()}
    </Flex>
  )
}

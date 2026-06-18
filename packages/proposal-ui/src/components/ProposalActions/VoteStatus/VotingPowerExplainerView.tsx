import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { CHAIN_ID } from '@buildeross/types'
import { atoms, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'

import { VotingPowerCase } from './VotingPowerExplainer.helper'

export const VOTING_POWER_DOCS_URL =
  'https://docs.nouns.build/onboarding/governance/#-voting-power'

/**
 * Pure, presentational rendering of every VotingPowerExplainer case.
 *
 * All values are passed in already resolved so this view has no data hooks of
 * its own (besides `useLinks`, which is pure URL construction). The
 * hook-connected `VotingPowerExplainer` wraps this and feeds it derived values;
 * keeping the switch here lets the case rendering be exercised deterministically
 * (showcase galleries, tests) without mocking the chain.
 */
export interface VotingPowerExplainerViewProps {
  votingCase: VotingPowerCase
  /** chain id of the DAO (for auction / dao links) */
  chainId: CHAIN_ID
  /** DAO token address; when undefined, CTAs that need it are omitted */
  token?: `0x${string}`
  daoName?: string
  /** votesAvailable at the proposal snapshot */
  snapshotVotes: number
  /** votes the signer holds right now (post-snapshot acquisition copy) */
  currentVotes: number
  /** tokens the signer owns right now (delegation copy) */
  tokenCount: number
  /** votes delegated to the signer by others (aggregated copy) */
  delegatedVotes: number
  /** ENS/display name of the delegate the signer delegated to */
  delegateDisplayName: string
  /** preformatted snapshot date label, e.g. "Nov 14, 2023 1:00 PM GMT-3" */
  snapshotDateLabel: string
}

export const VotingPowerExplainerView: React.FC<VotingPowerExplainerViewProps> = ({
  votingCase,
  chainId,
  token,
  daoName,
  snapshotVotes,
  currentVotes,
  tokenCount,
  delegatedVotes,
  delegateDisplayName,
  snapshotDateLabel,
}) => {
  const { getAuctionLink, getDaoLink } = useLinks()
  // daoName is optional upstream; fall back so copy never renders a gap.
  const daoLabel = daoName ?? 'this DAO'

  const renderBody = () => {
    switch (votingCase) {
      case VotingPowerCase.Loading:
        return <Text color={'text2'}>Checking your voting power...</Text>

      case VotingPowerCase.NotConnected:
        return (
          <Text color={'text2'}>
            Connect your wallet to see your voting power for this proposal
          </Text>
        )

      case VotingPowerCase.NoTokens:
        return (
          <>
            <Text color={'text2'}>
              You do not hold any {daoLabel} tokens, so you cannot vote on this proposal.
              Win a token at auction to vote on future proposals.
            </Text>
            {token && (
              <LinkWrapper
                link={getAuctionLink(chainId, token)}
                color={'text2'}
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
            <Text color={'text2'}>
              {currentVotes > 0 ? (
                <>
                  Voting power for this proposal was snapshotted on {snapshotDateLabel}.
                  You received your {currentVotes}{' '}
                  {currentVotes === 1 ? 'vote' : 'votes'} after the snapshot, so{' '}
                  {currentVotes === 1 ? 'it' : 'they'} cannot be used on this proposal,
                  but {currentVotes === 1 ? 'it' : 'they'} will count on future proposals.
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
              color={'text2'}
              className={atoms({ textDecoration: 'underline' })}
            >
              Learn more about voting power
              <Icon id="arrow-top-right" size="sm" />
            </LinkWrapper>
          </>
        )

      case VotingPowerCase.DelegatedAway:
        return (
          <>
            <Text color={'text2'}>
              Your {tokenCount} {tokenCount === 1 ? 'vote is' : 'votes are'} delegated to{' '}
              {delegateDisplayName} for this proposal.
            </Text>
            {token && (
              <LinkWrapper
                link={getDaoLink(chainId, token, 'activity')}
                color={'text2'}
                className={atoms({ textDecoration: 'underline' })}
              >
                Update delegation
              </LinkWrapper>
            )}
          </>
        )

      case VotingPowerCase.CanVote:
        return (
          <Text color={'text2'}>
            You have{' '}
            <Text as="span" color="text1" fontWeight="display">
              {snapshotVotes} {snapshotVotes === 1 ? 'vote' : 'votes'}
            </Text>{' '}
            available for {daoLabel}
          </Text>
        )

      case VotingPowerCase.CanVoteWithDelegation:
        return (
          <Text color={'text2'}>
            You have{' '}
            <Text as="span" color="text1" fontWeight="display">
              {snapshotVotes} {snapshotVotes === 1 ? 'vote' : 'votes'}
            </Text>{' '}
            available for {daoLabel}, including {delegatedVotes} delegated to you by other
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
      align={{ '@initial': 'center', '@768': 'flex-start' }}
      textAlign={{ '@initial': 'center', '@768': 'left' }}
    >
      {renderBody()}
    </Flex>
  )
}

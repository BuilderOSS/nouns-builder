import { governorAbi, ProposalState } from '@buildeross/sdk/contract'
import {
  ProposalVoteFragment as ProposalVote,
  ProposalVoteSupport as Support,
} from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { Flex, Text } from '@buildeross/zord'
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { getAddress } from 'viem'
import { useAccount, useWatchContractEvent } from 'wagmi'

import { proposalActionButtonVariants } from '../ProposalActions.css'
import Pending from './Pending'
import Updatable from './Updatable'
import Vote from './Vote'
import { VoteModal } from './VoteModal'
import { VotingPowerExplainer } from './VotingPowerExplainer'

type SupportValue = 0 | 1 | 2

const valueToSupport: Record<SupportValue, Support> = {
  0: Support.Against,
  1: Support.For,
  2: Support.Abstain,
}
interface VoteStatusProps {
  votesAvailable: number
  proposalId: string
  voteStart: number
  // snapshot timestamp (proposal.timeCreated, unix seconds)
  timeCreated: number
  state: ProposalState
  title: string
  daoName?: string
  signerVote?: ProposalVote
  updateDeadline?: number | null
  candidateVersion?: unknown | null
}

export const VoteStatus: React.FC<VoteStatusProps> = ({
  signerVote,
  votesAvailable,
  proposalId,
  voteStart,
  timeCreated,
  state,
  daoName,
  title,
  updateDeadline,
  candidateVersion,
}) => {
  const chain = useChainStore((x) => x.chain)
  const { address: userAddress } = useAccount()
  const { governor } = useDaoStore((state) => state.addresses)
  const [showVoteModal, setShowVoteModal] = useState<boolean>(false)
  const [vote, setVote] = useState<ProposalVote | undefined>(signerVote)

  useEffect(() => {
    if (!userAddress) {
      return
    }

    const storedVote = sessionStorage.getItem(`vote-${proposalId}-${userAddress}`)

    if (storedVote) {
      if (!signerVote) {
        setVote(JSON.parse(storedVote))
      } else {
        // We don't need to store the signer vote anymore as the BE indexer has caught up
        sessionStorage.removeItem(`vote-${proposalId}-${userAddress}`)
      }
    }
  }, [userAddress, signerVote, proposalId])

  const shouldListen = useMemo(
    () => !signerVote && !!userAddress && state === ProposalState.Active,
    [userAddress, signerVote, state]
  )

  const handleOpenVoteModal = useCallback(() => {
    setShowVoteModal(true)
  }, [setShowVoteModal])

  useWatchContractEvent({
    address: shouldListen ? governor : undefined,
    abi: governorAbi,
    eventName: 'VoteCast',
    onLogs: async (logs) => {
      const { voter, proposalId: id, support, weight, reason } = logs[0].args
      if (id === proposalId && voter && getAddress(voter) === getAddress(userAddress!)) {
        const eventVote: ProposalVote = {
          voter,
          support: valueToSupport[Number(support) as SupportValue],
          weight: Number(weight),
          reason,
          timestamp: Math.floor(Date.now() / 1000),
        }

        setVote(eventVote)
        sessionStorage.setItem(
          `vote-${proposalId}-${userAddress}`,
          JSON.stringify(eventVote)
        )
      }
    },
  })

  return (
    <Flex
      direction={{ '@initial': 'column', '@768': 'row' }}
      w={{ '@initial': '100%', '@768': 'auto' }}
      justify={'flex-start'}
      align={'center'}
      style={{ minWidth: 0 }}
    >
      {/* Voting for proposal has not yet started (proposal is Pending) */}
      {/* Also show Pending for promoted proposals in Updatable state */}
      {state === ProposalState.Pending ||
      (state === ProposalState.Updatable && candidateVersion) ? (
        <Pending voteStart={voteStart} proposalId={proposalId} />
      ) : null}

      {/* Proposal is open but user cannot vote */}
      {state === ProposalState.Active && !votesAvailable && !vote ? (
        <Flex
          direction={{ '@initial': 'column', '@768': 'row' }}
          align={'center'}
          gap={'x3'}
          textAlign={{ '@initial': 'center', '@768': 'left' }}
          style={{ minWidth: 0 }}
        >
          <Flex
            className={proposalActionButtonVariants['voteDisabled']}
            w={{ '@initial': '100%', '@768': 'auto' }}
            style={{ flexShrink: 0 }}
          >
            Submit Vote
          </Flex>
          <VotingPowerExplainer
            snapshotVotes={votesAvailable}
            timeCreated={timeCreated}
            daoName={daoName}
          />
        </Flex>
      ) : null}

      {/* Proposal is open and user can vote */}
      {state === ProposalState.Active && votesAvailable && !vote ? (
        <Fragment>
          <Flex
            direction={'row'}
            w={{ '@initial': '100%', '@768': 'auto' }}
            pb={{ '@initial': 'x2', '@768': 'x0' }}
            align={'center'}
            style={{ flexShrink: 0 }}
          >
            <ContractButton
              chainId={chain.id}
              handleClick={handleOpenVoteModal}
              className={proposalActionButtonVariants['vote']}
              w={{ '@initial': '100%', '@768': 'auto' }}
            >
              {votesAvailable === 1 ? 'Submit Vote' : 'Submit Votes'}
            </ContractButton>
          </Flex>
          <Flex pl={'x3'} mt={{ '@initial': 'x1', '@768': 'x0' }} style={{ minWidth: 0 }}>
            <VotingPowerExplainer
              snapshotVotes={votesAvailable}
              timeCreated={timeCreated}
              daoName={daoName}
            />
          </Flex>
        </Fragment>
      ) : null}

      {/* User has voted */}
      {vote ? <Vote support={vote.support} weight={vote.weight} /> : null}

      {/* Proposal is in updatable period (but not promoted proposals) */}
      {state === ProposalState.Updatable && updateDeadline && !candidateVersion ? (
        <Updatable updateDeadline={updateDeadline} proposalId={proposalId} />
      ) : null}

      {/* Proposal ended and the user did not vote */}
      {state !== ProposalState.Active &&
      state !== ProposalState.Pending &&
      state !== ProposalState.Updatable &&
      !vote ? (
        <Flex direction={'row'} align={'center'}>
          <Text color={'text3'} ml={'x3'}>
            You did not participate in voting on this proposal
          </Text>
        </Flex>
      ) : null}

      <VoteModal
        title={title}
        proposalId={proposalId as `0x${string}`}
        votesAvailable={votesAvailable}
        showVoteModal={showVoteModal}
        setShowVoteModal={setShowVoteModal}
      />
    </Flex>
  )
}

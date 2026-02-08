import { useVotes } from '@buildeross/hooks/useVotes'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Flex } from '@buildeross/zord'
import React, { Fragment, useMemo } from 'react'
import { getAddress } from 'viem'
import { useAccount } from 'wagmi'

import { CancelButton } from './CancelButton'
import { ConnectWalletAction } from './ConnectWalletAction'
import { SuccessfulProposalActions } from './SuccessfulProposalActions'
import { VetoAction } from './VetoAction'
import { VoteStatus } from './VoteStatus'

interface ProposalActionsProps {
  daoName?: string
  proposal: Proposal
}

export const ProposalActions: React.FC<ProposalActionsProps> = ({
  daoName,
  proposal,
}) => {
  const { address: userAddress } = useAccount()
  const addresses = useDaoStore((state) => state.addresses)
  const chain = useChainStore((state) => state.chain)

  const { isLoading, isVetoer, votes } = useVotes({
    chainId: chain.id,
    collectionAddress: addresses.token,
    governorAddress: addresses.governor,
    signerAddress: userAddress,
    timestamp: BigInt(proposal.timeCreated),
  })

  const { votesAvailable, isProposer, signerVote } = useMemo(() => {
    const votesAvailable = !!votes ? Number(votes) : 0

    const isProposer =
      !!userAddress && getAddress(proposal.proposer) == getAddress(userAddress)

    const signerVote = !!userAddress
      ? proposal.votes?.find((vote) => getAddress(vote.voter) === getAddress(userAddress))
      : undefined

    return {
      votesAvailable,
      isProposer,
      signerVote,
    }
  }, [userAddress, votes, proposal.votes, proposal.proposer])

  if (!userAddress) return <ConnectWalletAction />
  if (isLoading) return null

  return (
    <Fragment>
      <SuccessfulProposalActions proposal={proposal} />

      <Flex
        direction={{ '@initial': 'column', '@768': 'row' }}
        w={'100%'}
        align={'center'}
        justify={'space-between'}
        p={{ '@initial': 'x4', '@768': 'x6' }}
        gap={'x3'}
        borderStyle={'solid'}
        borderWidth={'normal'}
        borderColor={'border'}
        borderRadius={'curved'}
      >
        <VoteStatus
          signerVote={signerVote}
          votesAvailable={votesAvailable}
          proposalId={proposal.proposalId}
          voteStart={proposal.voteStart}
          state={proposal.state}
          daoName={daoName}
          title={proposal.title || ''}
        />

        {isProposer && <CancelButton proposalId={proposal.proposalId} />}
      </Flex>

      {isVetoer && (
        <VetoAction
          proposalId={proposal.proposalId}
          proposalNumber={proposal.proposalNumber}
        />
      )}
    </Fragment>
  )
}

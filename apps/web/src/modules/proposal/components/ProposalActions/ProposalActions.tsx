import { AddressType } from '@buildeross/types'
import { Flex } from '@buildeross/zord'
import React, { Fragment } from 'react'
import { getAddress } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'

import { governorAbi } from 'src/data/contract/abis'
import { ProposalState } from 'src/data/contract/requests/getProposalState'
import { Proposal } from 'src/data/subgraph/requests/proposalQuery'
import { ProposalVoteFragment as ProposalVote } from 'src/data/subgraph/sdk.generated'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { isProposalOpen, isProposalSuccessful } from 'src/utils/proposalState'

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
  const chain = useChainStore((x) => x.chain)

  const { proposer, title, voteStart, proposalId, proposalNumber, timeCreated, state } =
    proposal

  const { data } = useReadContracts({
    query: {
      enabled: !!userAddress,
    },
    allowFailure: false,
    contracts: [
      {
        abi: governorAbi,
        address: addresses?.governor as AddressType,
        chainId: chain.id,
        functionName: 'getVotes',
        args: [userAddress as AddressType, BigInt(timeCreated)],
      },
      {
        abi: governorAbi,
        address: addresses?.governor as AddressType,
        chainId: chain.id,
        functionName: 'vetoer',
      },
    ] as const,
  })

  const shouldShowActions =
    state === ProposalState.Active || state === ProposalState.Pending || userAddress

  if (shouldShowActions && !userAddress) return <ConnectWalletAction />
  if (!shouldShowActions || !data) return null

  const [votes, vetoer] = data

  const votesAvailable = !!votes ? Number(votes) : 0

  const signerVote: ProposalVote | undefined = userAddress
    ? proposal.votes?.find((vote) => getAddress(vote.voter) === getAddress(userAddress))
    : undefined

  const proposalOpen = isProposalOpen(state)
  const isProposer = !!userAddress && getAddress(proposer) == getAddress(userAddress)

  const isVetoer = userAddress ? userAddress === vetoer : false

  const showCancel = proposalOpen && isProposer
  const showVeto = proposalOpen && isVetoer

  const displaySucceededActions = isProposalSuccessful(proposal.state)

  return (
    <Fragment>
      {displaySucceededActions && <SuccessfulProposalActions proposal={proposal} />}

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
          proposalId={proposalId}
          voteStart={voteStart}
          state={state}
          daoName={daoName}
          title={title || ''}
        />

        {showCancel && <CancelButton proposalId={proposalId} />}
      </Flex>

      {showVeto && <VetoAction proposalId={proposalId} proposalNumber={proposalNumber} />}
    </Fragment>
  )
}

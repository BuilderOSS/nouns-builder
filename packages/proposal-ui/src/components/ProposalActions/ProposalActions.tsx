import { governorAbi } from '@buildeross/sdk/contract'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { Flex } from '@buildeross/zord'
import React, { Fragment, useMemo } from 'react'
import { getAddress } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'

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

  const { data, isLoading } = useReadContracts({
    query: {
      enabled: !!userAddress,
    },
    allowFailure: false,
    contracts: [
      {
        abi: governorAbi,
        address: addresses.governor as AddressType,
        chainId: chain.id,
        functionName: 'getVotes',
        args: [userAddress as AddressType, BigInt(proposal.timeCreated)],
      },
      {
        abi: governorAbi,
        address: addresses.governor as AddressType,
        chainId: chain.id,
        functionName: 'vetoer',
      },
    ] as const,
  })

  const { votesAvailable, isVetoer, isProposer, signerVote } = useMemo(() => {
    const [votes, vetoer] = data ?? [undefined, undefined]

    const votesAvailable = !!votes ? Number(votes) : 0

    const isVetoer =
      !!userAddress && !!vetoer && getAddress(vetoer) === getAddress(userAddress)

    const isProposer =
      !!userAddress && getAddress(proposal.proposer) == getAddress(userAddress)

    const signerVote = !!userAddress
      ? proposal.votes?.find((vote) => getAddress(vote.voter) === getAddress(userAddress))
      : undefined

    return {
      votesAvailable,
      isVetoer,
      isProposer,
      signerVote,
    }
  }, [data, userAddress, proposal.votes, proposal.proposer])

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

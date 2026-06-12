import { useDaoMembership } from '@buildeross/hooks/useDaoMembership'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useVotes } from '@buildeross/hooks/useVotes'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { handleGMTOffset } from '@buildeross/utils/helpers'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { getVotingPowerCase } from './VotingPowerExplainer.helper'
import { VotingPowerExplainerView } from './VotingPowerExplainerView'

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
    .format('MMM D, YYYY h:mm A')} ${handleGMTOffset()}`

  return (
    <VotingPowerExplainerView
      votingCase={votingCase}
      chainId={chain.id}
      token={token}
      daoName={daoName}
      snapshotVotes={snapshotVotes}
      currentVotes={Number(currentVotes)}
      tokenCount={tokenCount}
      delegatedVotes={delegatedVotes}
      delegateDisplayName={delegateEns.displayName}
      snapshotDateLabel={snapshotDateLabel}
    />
  )
}

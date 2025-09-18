import SWR_KEYS from '@buildeross/constants/swrKeys'
import {
  OrderDirection,
  Proposal,
  Snapshot_OrderBy,
  SubgraphSDK,
} from '@buildeross/sdk/subgraph'
import { Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { propPageWrapper } from 'src/styles/Proposals.css'
import useSWR from 'swr'

import { VotePlacard } from './VotePlacard'
import { VoterParticipation } from './VoterParticipation'

export type ProposalVotesProps = {
  proposal: Proposal
}

export const ProposalVotes: React.FC<ProposalVotesProps> = ({ proposal }) => {
  const totalVotes = useMemo(() => {
    if (!proposal.votes) return 0
    return proposal.votes.reduce((acc, vote) => acc + vote.weight, 0)
  }, [proposal.votes])
  const addresses = useDaoStore((x) => x.addresses)
  const chain = useChainStore((x) => x.chain)

  const hasVotes = proposal.votes?.length || 0 > 0

  const { data: snapshot } = useSWR(
    addresses.token
      ? [SWR_KEYS.SNAPSHOT_SUPPLY, chain.id, addresses.token, proposal.timeCreated]
      : null,
    () =>
      SubgraphSDK.connect(chain.id)
        .snapshots({
          where: {
            dao: addresses.token?.toLowerCase(),
            timestamp_lte: proposal.timeCreated,
          },
          orderBy: Snapshot_OrderBy.Timestamp,
          orderDirection: OrderDirection.Desc,
          first: 1,
        })
        .then((x) => x.snapshots[0])
  )

  const maxVotes = useMemo(() => {
    if (!snapshot) return 0
    return snapshot.totalSupply
  }, [snapshot])

  return (
    <Flex className={propPageWrapper}>
      {hasVotes ? (
        <>
          <VoterParticipation totalVotes={totalVotes} maxVotes={maxVotes} />
          {proposal.votes
            ?.map((vote) => <VotePlacard vote={vote} totalVotes={totalVotes} />)
            .reverse()}
        </>
      ) : (
        <Text textAlign={'center'} color="text3" mt="x4">
          No votes yet for this proposal.
        </Text>
      )}
    </Flex>
  )
}

import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import {
  OrderDirection,
  Proposal,
  Snapshot_OrderBy,
  SubgraphSDK,
} from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import useSWR from 'swr'

import { propPageWrapper } from '../styles.css'
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
      ? ([
          SWR_KEYS.SNAPSHOT_SUPPLY,
          chain.id,
          addresses.token,
          proposal.timeCreated,
        ] as const)
      : null,
    ([, _chainId, _token, _timestamp]) =>
      SubgraphSDK.connect(_chainId)
        .snapshots({
          where: {
            dao: _token.toLowerCase(),
            timestamp_lte: _timestamp,
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
            ?.map((vote) => (
              <VotePlacard key={vote.voter} vote={vote} totalVotes={totalVotes} />
            ))
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

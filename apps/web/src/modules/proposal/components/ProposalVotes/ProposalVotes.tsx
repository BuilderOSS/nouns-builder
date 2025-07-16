import { Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import useSWR from 'swr'

import SWR_KEYS from 'src/constants/swrKeys'
import { SDK } from 'src/data/subgraph/client'
import { Proposal } from 'src/data/subgraph/requests/proposalQuery'
import { OrderDirection, Token_OrderBy } from 'src/data/subgraph/sdk.generated'
import { useDaoStore } from 'src/modules/dao'
import { useChainStore } from 'src/stores/useChainStore'
import { propPageWrapper } from 'src/styles/Proposals.css'

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

  const { data: tokenAtTimestamp } = useSWR(
    addresses.token
      ? [SWR_KEYS.AUCTION_SETTLED, chain.id, addresses.token, proposal.timeCreated]
      : null,
    () =>
      SDK.connect(chain.id)
        .tokens({
          where: {
            tokenContract: addresses.token?.toLowerCase(),
            mintedAt_lt: proposal.timeCreated,
          },
          orderBy: Token_OrderBy.TokenId,
          orderDirection: OrderDirection.Desc,
          first: 1,
        })
        .then((x) => x.tokens[0])
  )

  const maxVotes = useMemo(() => {
    if (!tokenAtTimestamp) return 0
    return parseInt(tokenAtTimestamp?.tokenId) + 1 // + 1 for tokenId 0
  }, [tokenAtTimestamp])

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

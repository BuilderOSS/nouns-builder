import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { OrderDirection, Snapshot_OrderBy, SubgraphSDK } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Text } from '@buildeross/zord'
import React from 'react'
import useSWR from 'swr'

import { ParticipationHistoryChart } from './ParticipationHistoryChart'
import { metricsSkeleton } from './VoteMetrics.css'
import { ParticipationHistoryEntry } from './VoteMetrics.helper'

const PROPOSAL_HISTORY_LIMIT = 10

const fetchParticipationHistory = async (
  chainId: CHAIN_ID,
  token: string
): Promise<ParticipationHistoryEntry[]> => {
  const data = await SubgraphSDK.connect(chainId).proposals({
    where: { dao: token.toLowerCase() },
    first: PROPOSAL_HISTORY_LIMIT,
  })
  const entries = await Promise.all(
    data.proposals.map(async (proposal) => {
      const snapshot = await SubgraphSDK.connect(chainId)
        .snapshots({
          where: { dao: token.toLowerCase(), timestamp_lte: proposal.timeCreated },
          orderBy: Snapshot_OrderBy.Timestamp,
          orderDirection: OrderDirection.Desc,
          first: 1,
        })
        .then((x) => x.snapshots[0])
      const votesCast = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes
      const totalSupply = snapshot?.totalSupply ?? 0
      return {
        proposalNumber: proposal.proposalNumber,
        title: proposal.title ?? '',
        votesCast,
        totalSupply,
        participationPct: totalSupply > 0 ? (votesCast / totalSupply) * 100 : 0,
      }
    })
  )
  return entries.reverse()
}

export const ParticipationHistory: React.FC = () => {
  const addresses = useDaoStore((x) => x.addresses)
  const chain = useChainStore((x) => x.chain)

  const { data, error } = useSWR(
    addresses.token
      ? ([SWR_KEYS.PARTICIPATION_HISTORY, chain.id, addresses.token] as const)
      : null,
    ([, chainId, token]) => fetchParticipationHistory(chainId, token),
    { revalidateOnFocus: false }
  )

  if (!addresses.token) return null
  if (error) return null

  if (!data)
    return (
      <Box
        w="100%"
        mt="x4"
        borderRadius="curved"
        backgroundColor="background2"
        className={metricsSkeleton}
        data-testid="participation-history-loading"
      />
    )

  if (data.length < 2) return null

  return (
    <Box
      borderStyle="solid"
      borderColor="border"
      borderRadius="curved"
      w="100%"
      py="x4"
      px={{ '@initial': 'x4', '@768': 'x6' }}
      mt="x4"
      data-testid="participation-history"
    >
      <Text variant="heading-xs" fontWeight="display">
        Participation history
      </Text>
      <Text color="text2" mb="x4">
        Share of token supply voting in recent proposals
      </Text>
      <ParticipationHistoryChart entries={data} />
    </Box>
  )
}

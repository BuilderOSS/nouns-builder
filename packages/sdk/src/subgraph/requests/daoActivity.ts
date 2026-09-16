import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

import { SDK } from '../client'
import { FeedEvent_Filter, FeedEventsQuery, FeedEventType } from '../sdk.generated'

export type RecentVote = {
  voter: Address
  proposalId: string
  timestamp: number
}

export type DaoActivityResponse = {
  recentProposalIds: string[]
  votes: RecentVote[]
}

export type DaoActivityOptions = {
  recentProposalCount?: number
  nowSeconds?: number
}

const PAGE_SIZE = 1000
const MAX_PAGES = 10

const fetchVoteEventsSince = async (
  chainId: CHAIN_ID,
  dao: string,
  sinceSeconds: number
): Promise<FeedEventsQuery['feedEvents']> => {
  const events: FeedEventsQuery['feedEvents'] = []
  let cursor: number | undefined

  for (let page = 0; page < MAX_PAGES; page++) {
    const where: FeedEvent_Filter = {
      dao,
      type: FeedEventType.ProposalVoted,
      timestamp_gte: sinceSeconds.toString(),
      ...(cursor !== undefined ? { timestamp_lt: cursor.toString() } : {}),
    }

    const data = await SDK.connect(chainId).feedEvents({ first: PAGE_SIZE, where })
    events.push(...data.feedEvents)

    if (data.feedEvents.length < PAGE_SIZE) break
    cursor = Number(data.feedEvents[data.feedEvents.length - 1].timestamp)
  }

  return events
}

/** Voting activity on the DAO's most recent completed, non-canceled proposals. */
export const daoActivityRequest = async (
  chainId: CHAIN_ID,
  collectionAddress: string,
  options?: DaoActivityOptions
): Promise<DaoActivityResponse> => {
  const nowSeconds = options?.nowSeconds ?? Math.floor(Date.now() / 1000)
  const recentProposalCount = options?.recentProposalCount ?? 5

  const dao = collectionAddress.toLowerCase()

  const proposalsData = await SDK.connect(chainId).proposals({
    where: { dao, voteEnd_lt: nowSeconds.toString(), canceled_not: true },
    first: recentProposalCount,
  })

  const recentProposals = proposalsData.proposals
  const recentProposalIds = recentProposals.map((p) => String(p.proposalId))
  const proposalIdSet = new Set(recentProposalIds.map((id) => id.toLowerCase()))

  const earliestVoteStart = recentProposals.length
    ? Math.min(...recentProposals.map((p) => Number(p.voteStart)))
    : undefined

  const voteEvents =
    earliestVoteStart !== undefined
      ? await fetchVoteEventsSince(chainId, dao, earliestVoteStart)
      : []

  const votes: RecentVote[] = voteEvents.flatMap((event) =>
    event.__typename === 'ProposalVotedEvent' &&
    proposalIdSet.has(String(event.proposal.proposalId).toLowerCase())
      ? [
          {
            voter: event.actor as Address,
            proposalId: String(event.proposal.proposalId),
            timestamp: Number(event.timestamp),
          },
        ]
      : []
  )

  return { recentProposalIds, votes }
}

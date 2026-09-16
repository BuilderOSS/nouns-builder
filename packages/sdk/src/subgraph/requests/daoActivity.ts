import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

import { SDK } from '../client'
import {
  FeedEvent_Filter,
  FeedEvent_OrderBy,
  FeedEventsQuery,
  FeedEventType,
  Proposal_OrderBy,
} from '../sdk.generated'

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

const fetchVoteEventsSince = async (
  chainId: CHAIN_ID,
  dao: string,
  sinceSeconds: number
): Promise<FeedEventsQuery['feedEvents']> => {
  const events: FeedEventsQuery['feedEvents'] = []
  let cursor: string | undefined

  while (true) {
    const where: FeedEvent_Filter = {
      dao,
      type: FeedEventType.ProposalVoted,
      timestamp_gte: sinceSeconds.toString(),
      ...(cursor !== undefined ? { timestamp_lt: cursor } : {}),
    }

    const data = await SDK.connect(chainId).feedEvents({ first: PAGE_SIZE, where })
    if (data.feedEvents.length < PAGE_SIZE) {
      events.push(...data.feedEvents)
      break
    }

    // The API only supports one orderBy. Drain the boundary timestamp by ID
    // before advancing, so the effective cursor is (timestamp, id).
    cursor = String(data.feedEvents[data.feedEvents.length - 1].timestamp)
    events.push(...data.feedEvents.filter((event) => String(event.timestamp) !== cursor))
    let idCursor: string | undefined
    while (true) {
      const boundary = await SDK.connect(chainId).feedEvents({
        first: PAGE_SIZE,
        orderBy: FeedEvent_OrderBy.Id,
        where: {
          ...where,
          timestamp: cursor,
          ...(idCursor !== undefined ? { id_lt: idCursor } : {}),
        },
      })
      events.push(...boundary.feedEvents)
      if (boundary.feedEvents.length < PAGE_SIZE) break
      idCursor = boundary.feedEvents[boundary.feedEvents.length - 1].id
    }
  }

  return events.sort((a, b) => {
    const timeOrder = Number(b.timestamp) - Number(a.timestamp)
    return timeOrder || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0)
  })
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
    orderBy: Proposal_OrderBy.VoteEnd,
  })

  let recentProposals = proposalsData.proposals
  // Resolve ties at the limit before truncation, including proposals omitted
  // by the voteEnd-only query. proposalNumber is unique within a DAO.
  if (recentProposals.length && recentProposals.length === recentProposalCount) {
    const voteEnd = recentProposals[recentProposals.length - 1].voteEnd
    const newer = recentProposals.filter((proposal) => proposal.voteEnd !== voteEnd)
    const boundary = await SDK.connect(chainId).proposals({
      where: { dao, voteEnd, voteEnd_lt: nowSeconds.toString(), canceled_not: true },
      first: recentProposalCount - newer.length,
      orderBy: Proposal_OrderBy.ProposalNumber,
    })
    recentProposals = [...newer, ...boundary.proposals]
  }
  recentProposals.sort(
    (a, b) => Number(b.voteEnd) - Number(a.voteEnd) || b.proposalNumber - a.proposalNumber
  )
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

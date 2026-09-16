import { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FeedEvent_OrderBy, FeedEventType, Proposal_OrderBy } from '../sdk.generated'
import { daoActivityRequest } from './daoActivity'

const sdkMock = vi.hoisted(() => ({
  proposals: vi.fn(),
  feedEvents: vi.fn(),
}))

vi.mock('../client', () => ({ SDK: { connect: () => sdkMock } }))

const dao = '0x1000000000000000000000000000000000000001'
const voter = '0xaaa0000000000000000000000000000000000001'
const nowSeconds = 1800000000
const oldVoteTime = nowSeconds - 120 * 24 * 60 * 60

describe('daoActivityRequest', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    const proposals = Array.from({ length: 5 }, (_, i) => ({
      proposalId: `p${5 - i}`,
      proposalNumber: 5 - i,
      voteStart: oldVoteTime - i * 86400,
      voteEnd: String(oldVoteTime + 86400 - i),
    }))
    sdkMock.proposals.mockImplementation(({ where, first }) => ({
      proposals: proposals
        .filter((p) => !where.voteEnd || p.voteEnd === where.voteEnd)
        .slice(0, first),
    }))
    sdkMock.feedEvents.mockResolvedValue({ feedEvents: [] })
  })

  it('fetches only votes and keeps votes older than 90 days on the five eligible proposals', async () => {
    const vote = (proposalId: string) => ({
      __typename: 'ProposalVotedEvent',
      actor: voter,
      timestamp: oldVoteTime.toString(),
      proposal: { proposalId },
    })
    sdkMock.feedEvents.mockResolvedValue({
      feedEvents: [vote('p5'), vote('p0'), vote('ongoing'), vote('canceled')],
    })

    const result = await daoActivityRequest(CHAIN_ID.ETHEREUM, dao, {
      nowSeconds,
    })

    expect(sdkMock.proposals).toHaveBeenCalledWith({
      where: { dao, voteEnd_lt: nowSeconds.toString(), canceled_not: true },
      first: 5,
      orderBy: Proposal_OrderBy.VoteEnd,
    })
    expect(result.votes).toEqual([{ voter, proposalId: 'p5', timestamp: oldVoteTime }])
    expect(sdkMock.feedEvents).toHaveBeenCalledTimes(1)
    expect(sdkMock.feedEvents).toHaveBeenCalledWith({
      first: 1000,
      where: {
        dao,
        type: FeedEventType.ProposalVoted,
        timestamp_gte: (oldVoteTime - 4 * 86400).toString(),
      },
    })
  })

  it('does not fetch activity when there are no completed proposals', async () => {
    sdkMock.proposals.mockResolvedValue({ proposals: [] })

    expect(await daoActivityRequest(CHAIN_ID.ETHEREUM, dao)).toEqual({
      recentProposalIds: [],
      votes: [],
    })
    expect(sdkMock.feedEvents).not.toHaveBeenCalled()
  })

  it('exhausts more than ten pages, including shared boundary timestamps, without duplicates', async () => {
    const events = Array.from({ length: 11002 }, (_, i) => ({
      __typename: 'ProposalVotedEvent',
      id: String(i).padStart(6, '0'),
      actor: `0x${i.toString(16).padStart(40, '0')}`,
      timestamp: String(oldVoteTime + (i === 0 ? 1 : i === 11001 ? -1 : 0)),
      proposal: { proposalId: 'p5' },
    }))
    sdkMock.feedEvents.mockImplementation(({ first, where, orderBy }) => ({
      feedEvents: events
        .filter(
          (event) =>
            Number(event.timestamp) >= Number(where.timestamp_gte) &&
            (!where.timestamp_lt ||
              Number(event.timestamp) < Number(where.timestamp_lt)) &&
            (!where.timestamp || event.timestamp === where.timestamp) &&
            (!where.id_lt || event.id < where.id_lt)
        )
        .sort((a, b) =>
          orderBy === FeedEvent_OrderBy.Id
            ? b.id.localeCompare(a.id)
            : Number(b.timestamp) - Number(a.timestamp)
        )
        .slice(0, first),
    }))

    const result = await daoActivityRequest(CHAIN_ID.ETHEREUM, dao, { nowSeconds })

    expect(result.votes).toHaveLength(events.length)
    expect(new Set(result.votes.map((vote) => vote.voter)).size).toBe(events.length)
    expect(result.votes.map((v) => v.timestamp)).toEqual(
      events.map((event) => Number(event.timestamp))
    )
    expect(sdkMock.feedEvents.mock.calls.length).toBeGreaterThan(10)
    expect(sdkMock.feedEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: FeedEvent_OrderBy.Id,
        where: expect.objectContaining({
          timestamp: String(oldVoteTime),
          id_lt: expect.any(String),
        }),
      })
    )
  })

  it('selects by completion time and resolves ties before applying the limit', async () => {
    const proposals = [
      { proposalId: 'p9', proposalNumber: 9, voteEnd: '100', voteStart: '10' },
      { proposalId: 'p2', proposalNumber: 2, voteEnd: '300', voteStart: '20' },
      { proposalId: 'p3', proposalNumber: 3, voteEnd: '200', voteStart: '30' },
      { proposalId: 'p4', proposalNumber: 4, voteEnd: '200', voteStart: '40' },
      {
        proposalId: 'ongoing',
        proposalNumber: 10,
        voteEnd: String(nowSeconds),
        voteStart: '50',
      },
      {
        proposalId: 'canceled',
        proposalNumber: 11,
        voteEnd: '400',
        voteStart: '60',
        canceled: true,
      },
    ]
    sdkMock.proposals.mockImplementation(({ where, first, orderBy }) => ({
      proposals: proposals
        .filter(
          (p) =>
            Number(p.voteEnd) < Number(where.voteEnd_lt) &&
            p.canceled !== where.canceled_not &&
            (!where.voteEnd || p.voteEnd === where.voteEnd)
        )
        .sort((a, b) =>
          orderBy === Proposal_OrderBy.VoteEnd
            ? Number(b.voteEnd) - Number(a.voteEnd)
            : b.proposalNumber - a.proposalNumber
        )
        .slice(0, first),
    }))

    const result = await daoActivityRequest(CHAIN_ID.ETHEREUM, dao, {
      nowSeconds,
      recentProposalCount: 2,
    })

    expect(result.recentProposalIds).toEqual(['p2', 'p4'])
    expect(sdkMock.feedEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ timestamp_gte: '20' }),
      })
    )
  })

  it('preserves a zero proposal limit', async () => {
    const result = await daoActivityRequest(CHAIN_ID.ETHEREUM, dao, {
      recentProposalCount: 0,
    })
    expect(result).toEqual({ recentProposalIds: [], votes: [] })
    expect(sdkMock.proposals).toHaveBeenCalledTimes(1)
    expect(sdkMock.feedEvents).not.toHaveBeenCalled()
  })
})

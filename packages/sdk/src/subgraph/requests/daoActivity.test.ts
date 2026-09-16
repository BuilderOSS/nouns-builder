import { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Proposal_OrderBy } from '../sdk.generated'
import { daoActivityRequest } from './daoActivity'

const sdkMock = vi.hoisted(() => ({
  proposals: vi.fn(),
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
      votes: [],
    }))
    sdkMock.proposals.mockImplementation(({ where, first }) => ({
      proposals: proposals
        .filter((p) => !where.voteEnd || p.voteEnd === where.voteEnd)
        .slice(0, first),
    }))
  })

  it('fetches only votes from the eligible proposals', async () => {
    const proposals = [
      {
        proposalId: 'p5',
        proposalNumber: 5,
        voteStart: oldVoteTime,
        voteEnd: String(oldVoteTime + 86400),
        votes: [{ voter, timestamp: oldVoteTime.toString() }],
      },
      {
        proposalId: 'p4',
        proposalNumber: 4,
        voteStart: oldVoteTime - 86400,
        voteEnd: String(oldVoteTime + 86400 - 1),
        votes: [],
      },
      {
        proposalId: 'p3',
        proposalNumber: 3,
        voteStart: oldVoteTime - 2 * 86400,
        voteEnd: String(oldVoteTime + 86400 - 2),
        votes: [],
      },
      {
        proposalId: 'p2',
        proposalNumber: 2,
        voteStart: oldVoteTime - 3 * 86400,
        voteEnd: String(oldVoteTime + 86400 - 3),
        votes: [],
      },
      {
        proposalId: 'p1',
        proposalNumber: 1,
        voteStart: oldVoteTime - 4 * 86400,
        voteEnd: String(oldVoteTime + 86400 - 4),
        votes: [],
      },
    ]
    sdkMock.proposals.mockImplementation(({ where, first }) => ({
      proposals: proposals
        .filter((p) => !where.voteEnd || p.voteEnd === where.voteEnd)
        .slice(0, first),
    }))

    const result = await daoActivityRequest(CHAIN_ID.ETHEREUM, dao, {
      nowSeconds,
    })

    expect(sdkMock.proposals).toHaveBeenCalledWith({
      where: { dao, voteEnd_lt: nowSeconds.toString(), canceled_not: true },
      first: 5,
      orderBy: Proposal_OrderBy.VoteEnd,
    })
    expect(result.votes).toEqual([{ voter, proposalId: 'p5', timestamp: oldVoteTime }])
  })

  it('does not fetch activity when there are no completed proposals', async () => {
    sdkMock.proposals.mockResolvedValue({ proposals: [] })

    expect(await daoActivityRequest(CHAIN_ID.ETHEREUM, dao)).toEqual({
      recentProposalIds: [],
      votes: [],
    })
  })

  it('handles proposals with many votes', async () => {
    const votes = Array.from({ length: 11002 }, (_, i) => ({
      voter: `0x${i.toString(16).padStart(40, '0')}`,
      timestamp: String(oldVoteTime + (i === 0 ? 1 : i === 11001 ? -1 : 0)),
    }))
    const proposals = [
      {
        proposalId: 'p5',
        proposalNumber: 5,
        voteStart: oldVoteTime,
        voteEnd: String(oldVoteTime + 86400),
        votes,
      },
      {
        proposalId: 'p4',
        proposalNumber: 4,
        voteStart: oldVoteTime - 86400,
        voteEnd: String(oldVoteTime + 86400 - 1),
        votes: [],
      },
      {
        proposalId: 'p3',
        proposalNumber: 3,
        voteStart: oldVoteTime - 2 * 86400,
        voteEnd: String(oldVoteTime + 86400 - 2),
        votes: [],
      },
      {
        proposalId: 'p2',
        proposalNumber: 2,
        voteStart: oldVoteTime - 3 * 86400,
        voteEnd: String(oldVoteTime + 86400 - 3),
        votes: [],
      },
      {
        proposalId: 'p1',
        proposalNumber: 1,
        voteStart: oldVoteTime - 4 * 86400,
        voteEnd: String(oldVoteTime + 86400 - 4),
        votes: [],
      },
    ]
    sdkMock.proposals.mockImplementation(({ where, first }) => ({
      proposals: proposals
        .filter((p) => !where.voteEnd || p.voteEnd === where.voteEnd)
        .slice(0, first),
    }))

    const result = await daoActivityRequest(CHAIN_ID.ETHEREUM, dao, { nowSeconds })

    expect(result.votes).toHaveLength(votes.length)
    expect(new Set(result.votes.map((vote) => vote.voter)).size).toBe(votes.length)
    expect(result.votes.map((v) => v.timestamp)).toEqual(
      votes.map((vote) => Number(vote.timestamp))
    )
  })

  it('selects by completion time and resolves ties before applying the limit', async () => {
    const proposals = [
      { proposalId: 'p9', proposalNumber: 9, voteEnd: '100', voteStart: '10', votes: [] },
      { proposalId: 'p2', proposalNumber: 2, voteEnd: '300', voteStart: '20', votes: [] },
      { proposalId: 'p3', proposalNumber: 3, voteEnd: '200', voteStart: '30', votes: [] },
      { proposalId: 'p4', proposalNumber: 4, voteEnd: '200', voteStart: '40', votes: [] },
      {
        proposalId: 'ongoing',
        proposalNumber: 10,
        voteEnd: String(nowSeconds),
        voteStart: '50',
        votes: [],
      },
      {
        proposalId: 'canceled',
        proposalNumber: 11,
        voteEnd: '400',
        voteStart: '60',
        canceled: true,
        votes: [],
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
  })

  it('preserves a zero proposal limit', async () => {
    const result = await daoActivityRequest(CHAIN_ID.ETHEREUM, dao, {
      recentProposalCount: 0,
    })
    expect(result).toEqual({ recentProposalIds: [], votes: [] })
    expect(sdkMock.proposals).toHaveBeenCalledTimes(1)
  })
})

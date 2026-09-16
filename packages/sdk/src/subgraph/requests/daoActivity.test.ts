import { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FeedEventType } from '../sdk.generated'
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
    sdkMock.proposals.mockResolvedValue({
      proposals: Array.from({ length: 5 }, (_, i) => ({
        proposalId: `p${5 - i}`,
        voteStart: oldVoteTime - i * 86400,
      })),
    })
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
})

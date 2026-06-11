import { ProposalVoteFragment, ProposalVoteSupport } from '@buildeross/sdk/subgraph'
import { describe, expect, it } from 'vitest'

import {
  buildCumulativeVoteSeries,
  countToY,
  findTimelineIndex,
  timeToX,
  toStepPoints,
} from './VoteMetrics.helper'

const VOTE_START = 1_700_000_000
const VOTE_END = VOTE_START + 86_400
const CHART_WIDTH = 480
const PADDING_X = 10
const CHART_HEIGHT = 160
const PADDING_Y = 30

const makeVote = (
  support: ProposalVoteSupport,
  weight: number,
  timestamp: number | undefined
): ProposalVoteFragment =>
  ({
    voter: '0x1',
    support,
    weight,
    reason: null,
    timestamp,
  }) as ProposalVoteFragment

describe('buildCumulativeVoteSeries', () => {
  it('builds a zero-anchored cumulative series sorted by timestamp', () => {
    const votes = [
      makeVote(ProposalVoteSupport.For, 2, VOTE_START + 200),
      makeVote(ProposalVoteSupport.Against, 1, VOTE_START + 100),
      makeVote(ProposalVoteSupport.For, 3, VOTE_START + 300),
    ]
    const series = buildCumulativeVoteSeries(
      votes,
      VOTE_START,
      VOTE_END,
      VOTE_START + 300
    )

    expect(series[0]).toEqual({
      timestamp: VOTE_START,
      forVotes: 0,
      againstVotes: 0,
      abstainVotes: 0,
    })
    expect(series[1]).toEqual({
      timestamp: VOTE_START + 100,
      forVotes: 0,
      againstVotes: 1,
      abstainVotes: 0,
    })
    expect(series[2]).toEqual({
      timestamp: VOTE_START + 200,
      forVotes: 2,
      againstVotes: 1,
      abstainVotes: 0,
    })
    expect(series[3]).toEqual({
      timestamp: VOTE_START + 300,
      forVotes: 5,
      againstVotes: 1,
      abstainVotes: 0,
    })
  })

  it('clamps vote timestamps into the voting window', () => {
    const votes = [
      makeVote(ProposalVoteSupport.For, 1, VOTE_START - 5_000),
      makeVote(ProposalVoteSupport.Abstain, 1, VOTE_END + 5_000),
    ]
    const series = buildCumulativeVoteSeries(votes, VOTE_START, VOTE_END, VOTE_END)

    expect(series[1].timestamp).toBe(VOTE_START)
    expect(series[2].timestamp).toBe(VOTE_END)
  })

  it('appends a flat extension point at min(now, voteEnd)', () => {
    const ongoing = buildCumulativeVoteSeries(
      [makeVote(ProposalVoteSupport.For, 1, VOTE_START + 100)],
      VOTE_START,
      VOTE_END,
      VOTE_START + 500
    )
    const ongoingLast = ongoing[ongoing.length - 1]
    expect(ongoingLast.timestamp).toBe(VOTE_START + 500)
    expect(ongoingLast.forVotes).toBe(1)

    const ended = buildCumulativeVoteSeries(
      [makeVote(ProposalVoteSupport.For, 1, VOTE_START + 100)],
      VOTE_START,
      VOTE_END,
      VOTE_END + 10_000
    )
    expect(ended[ended.length - 1].timestamp).toBe(VOTE_END)

    const atBoundary = buildCumulativeVoteSeries(
      [makeVote(ProposalVoteSupport.For, 1, VOTE_END)],
      VOTE_START,
      VOTE_END,
      VOTE_END
    )
    expect(atBoundary).toHaveLength(2)
    expect(atBoundary[1].timestamp).toBe(VOTE_END)
  })

  it('filters votes with missing or invalid timestamps', () => {
    const series = buildCumulativeVoteSeries(
      [makeVote(ProposalVoteSupport.For, 5, undefined)],
      VOTE_START,
      VOTE_END,
      VOTE_START
    )
    expect(series).toHaveLength(1)
    expect(series[0].forVotes).toBe(0)
  })
})

describe('timeToX', () => {
  it('maps window bounds to chart bounds and guards a degenerate window', () => {
    expect(timeToX(VOTE_START, VOTE_START, VOTE_END, CHART_WIDTH, PADDING_X)).toBe(
      PADDING_X
    )
    expect(timeToX(VOTE_END, VOTE_START, VOTE_END, CHART_WIDTH, PADDING_X)).toBe(
      PADDING_X + CHART_WIDTH
    )
    expect(timeToX(VOTE_START, VOTE_START, VOTE_START, CHART_WIDTH, PADDING_X)).toBe(
      PADDING_X
    )
    expect(timeToX(VOTE_START - 1000, VOTE_START, VOTE_END, CHART_WIDTH, PADDING_X)).toBe(
      PADDING_X
    )
    expect(timeToX(VOTE_END + 1000, VOTE_START, VOTE_END, CHART_WIDTH, PADDING_X)).toBe(
      PADDING_X + CHART_WIDTH
    )
  })
})

describe('countToY', () => {
  it('scales against max and guards divide-by-zero', () => {
    expect(countToY(10, 10, CHART_HEIGHT, PADDING_Y)).toBe(PADDING_Y)
    expect(countToY(0, 10, CHART_HEIGHT, PADDING_Y)).toBe(CHART_HEIGHT + PADDING_Y)
    expect(Number.isNaN(countToY(0, 0, CHART_HEIGHT, PADDING_Y))).toBe(false)
    expect(countToY(0, 0, CHART_HEIGHT, PADDING_Y)).toBe(CHART_HEIGHT + PADDING_Y)
  })
})

describe('toStepPoints', () => {
  it('emits step-after coordinates', () => {
    expect(
      toStepPoints([
        { x: 0, y: 10 },
        { x: 5, y: 4 },
      ])
    ).toBe('0,10 5,10 5,4')
  })
})

describe('findTimelineIndex', () => {
  it('returns the last point at or before the cursor time', () => {
    const points = buildCumulativeVoteSeries(
      [
        makeVote(ProposalVoteSupport.For, 1, VOTE_START + 100),
        makeVote(ProposalVoteSupport.For, 1, VOTE_START + 43_200),
      ],
      VOTE_START,
      VOTE_END,
      VOTE_END
    )

    expect(findTimelineIndex(0, points, VOTE_START, VOTE_END)).toBe(0)
    expect(findTimelineIndex(0.5, points, VOTE_START, VOTE_END)).toBeGreaterThanOrEqual(1)
    expect(findTimelineIndex(1, points, VOTE_START, VOTE_END)).toBe(points.length - 1)
    expect(findTimelineIndex(-1, points, VOTE_START, VOTE_END)).toBe(0)
  })
})

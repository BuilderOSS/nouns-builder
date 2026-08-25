import { ProposalVoteFragment, ProposalVoteSupport } from '@buildeross/sdk/subgraph'
import React from 'react'

export type TimelinePoint = {
  timestamp: number
  forVotes: number
  againstVotes: number
  abstainVotes: number
}

export type ParticipationHistoryEntry = {
  proposalNumber: number
  title: string
  votesCast: number
  totalSupply: number
  participationPct: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const clamp01 = (value: number): number => clamp(value, 0, 1)

export const buildCumulativeVoteSeries = (
  votes: ProposalVoteFragment[],
  voteStart: number,
  voteEnd: number,
  now: number
): TimelinePoint[] => {
  const sorted = votes
    .map((vote) => ({ vote, time: Number(vote.timestamp) }))
    .filter(({ time }) => Number.isFinite(time))
    .sort((a, b) => a.time - b.time)

  const points: TimelinePoint[] = [
    { timestamp: voteStart, forVotes: 0, againstVotes: 0, abstainVotes: 0 },
  ]

  let forVotes = 0
  let againstVotes = 0
  let abstainVotes = 0

  for (const { vote, time } of sorted) {
    if (vote.support === ProposalVoteSupport.For) {
      forVotes += vote.weight
    } else if (vote.support === ProposalVoteSupport.Against) {
      againstVotes += vote.weight
    } else if (vote.support === ProposalVoteSupport.Abstain) {
      abstainVotes += vote.weight
    }
    points.push({
      timestamp: clamp(time, voteStart, voteEnd),
      forVotes,
      againstVotes,
      abstainVotes,
    })
  }

  const last = points[points.length - 1]
  const extension = clamp(now, voteStart, voteEnd)
  if (extension > last.timestamp) {
    points.push({
      timestamp: extension,
      forVotes: last.forVotes,
      againstVotes: last.againstVotes,
      abstainVotes: last.abstainVotes,
    })
  }

  return points
}

export const timeToX = (
  timestamp: number,
  voteStart: number,
  voteEnd: number,
  chartWidth: number,
  paddingX: number
): number => {
  const span = voteEnd - voteStart
  if (span <= 0) return paddingX
  return paddingX + clamp01((timestamp - voteStart) / span) * chartWidth
}

export const countToY = (
  count: number,
  maxCount: number,
  chartHeight: number,
  paddingY: number
): number => chartHeight - (count / Math.max(maxCount, 1)) * chartHeight + paddingY

export const toStepPoints = (coords: Array<{ x: number; y: number }>): string => {
  if (coords.length === 0) return ''
  const segments = [`${coords[0].x},${coords[0].y}`]
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1]
    const curr = coords[i]
    segments.push(`${curr.x},${prev.y} ${curr.x},${curr.y}`)
  }
  return segments.join(' ')
}

export const findTimelineIndex = (
  cursorXFraction: number,
  points: TimelinePoint[],
  voteStart: number,
  voteEnd: number
): number => {
  const fraction = clamp01(cursorXFraction)
  const time = voteStart + fraction * (voteEnd - voteStart)
  let index = 0
  for (let i = 0; i < points.length; i++) {
    if (points[i].timestamp <= time) {
      index = i
    } else {
      break
    }
  }
  return Math.max(index, 0)
}

export const getCursorXFraction = (
  e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
): number => {
  const rect = e.currentTarget.getBoundingClientRect()
  if (rect.width === 0) return 0
  let clientX: number
  if ('touches' in e) {
    const touch = e.touches[0] || e.changedTouches[0]
    if (!touch) return 0
    clientX = touch.clientX
  } else {
    clientX = e.clientX
  }
  return (clientX - rect.left) / rect.width
}

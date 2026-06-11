import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { ProposalVoteFragment } from '@buildeross/sdk/subgraph'
import { Box, Flex, Text, vars } from '@buildeross/zord'
import dayjs from 'dayjs'
import React, { useMemo, useState } from 'react'

import { metricsSvg } from './VoteMetrics.css'
import {
  buildCumulativeVoteSeries,
  countToY,
  findTimelineIndex,
  getCursorXFraction,
  timeToX,
  toStepPoints,
} from './VoteMetrics.helper'

export type VoteTimelineProps = {
  votes: ProposalVoteFragment[]
  voteStart: number
  voteEnd: number
}

const WIDTH = 500
const HEIGHT = 220
const PADDING_X = 10
const PADDING_Y = 30
const chartWidth = WIDTH - PADDING_X * 2
const chartHeight = HEIGHT - PADDING_Y * 2

export const VoteTimeline: React.FC<VoteTimelineProps> = ({
  votes,
  voteStart,
  voteEnd,
}) => {
  const isMounted = useIsMounted()
  const [now] = useState(() => Math.floor(Date.now() / 1000))

  const validVotes = useMemo(
    () => votes.filter((v) => Number.isFinite(Number(v.timestamp))),
    [votes]
  )

  const points = useMemo(
    () => buildCumulativeVoteSeries(validVotes, voteStart, voteEnd, now),
    [validVotes, voteStart, voteEnd, now]
  )

  const [activeIndex, setActiveIndex] = useState(points.length - 1)
  const [cursorOpacity, setCursorOpacity] = useState(0)

  if (!isMounted || validVotes.length === 0) return null

  const last = points[points.length - 1]
  const maxCount = Math.max(last.forVotes, last.againstVotes, last.abstainVotes, 1)

  const safeIndex = Math.min(activeIndex, points.length - 1)
  const active = points[safeIndex]

  const series = (['forVotes', 'againstVotes', 'abstainVotes'] as const).map((key) => ({
    key,
    coords: points.map((p) => ({
      x: timeToX(p.timestamp, voteStart, voteEnd, chartWidth, PADDING_X),
      y: countToY(p[key], maxCount, chartHeight, PADDING_Y),
    })),
  }))

  const seriesColor = {
    forVotes: vars.color.positive,
    againstVotes: vars.color.negative,
    abstainVotes: vars.color.text3,
  } as const

  const seriesTestId = {
    forVotes: 'timeline-line-for',
    againstVotes: 'timeline-line-against',
    abstainVotes: 'timeline-line-abstain',
  } as const

  const handleMove = (
    e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
  ) => {
    setCursorOpacity(1)
    setActiveIndex(findTimelineIndex(getCursorXFraction(e), points, voteStart, voteEnd))
  }

  const handleEnter = () => setCursorOpacity(1)

  const handleLeave = () => {
    setCursorOpacity(0)
    setActiveIndex(points.length - 1)
  }

  const cursorX = series[0].coords[safeIndex].x

  return (
    <Box
      borderStyle="solid"
      borderColor="border"
      borderRadius="curved"
      w="100%"
      py="x4"
      px={{ '@initial': 'x4', '@768': 'x6' }}
      mt="x4"
      data-testid="vote-timeline"
    >
      <Text variant="heading-xs" fontWeight="display">
        Voting timeline
      </Text>
      <Flex wrap="wrap" gap="x4" mt="x2" align="center">
        <Flex align="center" gap="x1">
          <Box
            borderRadius="round"
            style={{ width: 8, height: 8, backgroundColor: vars.color.positive }}
          />
          <Text fontSize={14}>For {active.forVotes}</Text>
        </Flex>
        <Flex align="center" gap="x1">
          <Box
            borderRadius="round"
            style={{ width: 8, height: 8, backgroundColor: vars.color.negative }}
          />
          <Text fontSize={14}>Against {active.againstVotes}</Text>
        </Flex>
        <Flex align="center" gap="x1">
          <Box
            borderRadius="round"
            style={{ width: 8, height: 8, backgroundColor: vars.color.text3 }}
          />
          <Text fontSize={14}>Abstain {active.abstainVotes}</Text>
        </Flex>
        <Text color="text3" fontSize={14} ml="auto">
          {dayjs.unix(active.timestamp).format('MMM D, h:mm A')}
        </Text>
      </Flex>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={metricsSvg}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        onMouseEnter={handleEnter}
        onTouchStart={handleEnter}
        onMouseLeave={handleLeave}
        onTouchEnd={handleLeave}
      >
        <line
          x1={PADDING_X}
          x2={WIDTH - PADDING_X}
          y1={chartHeight + PADDING_Y}
          y2={chartHeight + PADDING_Y}
          stroke={vars.color.border}
        />
        {now < voteEnd && (
          <line
            x1={timeToX(now, voteStart, voteEnd, chartWidth, PADDING_X)}
            x2={timeToX(now, voteStart, voteEnd, chartWidth, PADDING_X)}
            y1={PADDING_Y}
            y2={chartHeight + PADDING_Y}
            stroke={vars.color.text3}
            strokeDasharray="4 4"
            opacity={0.4}
          />
        )}
        {series.map((s) => (
          <polyline
            key={s.key}
            data-testid={seriesTestId[s.key]}
            fill="none"
            stroke={seriesColor[s.key]}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={toStepPoints(s.coords)}
          />
        ))}
        <line
          x1={cursorX}
          x2={cursorX}
          y1={PADDING_Y}
          y2={chartHeight + PADDING_Y}
          stroke={vars.color.text1}
          opacity={0.2 * cursorOpacity}
          style={{ transition: 'opacity 0.5s' }}
        />
        {series.map((s) => (
          <circle
            key={s.key}
            cx={cursorX}
            cy={s.coords[safeIndex].y}
            r={3}
            fill={seriesColor[s.key]}
            opacity={cursorOpacity}
            style={{ transition: 'opacity 0.5s' }}
          />
        ))}
      </svg>
      <Flex w="100%" justify="space-between" mt="x1">
        <Text fontSize={12} color="text3">
          {dayjs.unix(voteStart).format('MMM D, YYYY, h:mm A')}
        </Text>
        <Text fontSize={12} color="text3">
          {dayjs.unix(voteEnd).format('MMM D, YYYY, h:mm A')}
        </Text>
      </Flex>
    </Box>
  )
}

import { Flex, Text, vars } from '@buildeross/zord'
import React, { useState } from 'react'

import { metricsSvg } from './VoteMetrics.css'
import { ParticipationHistoryEntry } from './VoteMetrics.helper'

export type ParticipationHistoryChartProps = {
  entries: ParticipationHistoryEntry[]
}

const WIDTH = 500
const HEIGHT = 160
const PADDING_X = 10
const PADDING_Y = 24
const BAR_GAP = 6
const chartWidth = WIDTH - PADDING_X * 2
const chartHeight = HEIGHT - PADDING_Y * 2

export const ParticipationHistoryChart: React.FC<ParticipationHistoryChartProps> = ({
  entries,
}) => {
  const [activeIndex, setActiveIndex] = useState(entries.length - 1)

  const safeIndex = Math.min(activeIndex, entries.length - 1)
  const active = entries[safeIndex]
  const barWidth = (chartWidth - BAR_GAP * (entries.length - 1)) / entries.length

  return (
    <Flex
      direction="column"
      w="100%"
      onMouseLeave={() => setActiveIndex(entries.length - 1)}
    >
      <Flex justify="space-between" mb="x2">
        <Text fontWeight="label">Proposal #{active.proposalNumber}</Text>
        <Text color="text3">
          {active.totalSupply === 0
            ? `--% · ${active.votesCast} votes`
            : `${active.participationPct.toFixed(1)}% · ${active.votesCast} of ${active.totalSupply} votes`}
        </Text>
      </Flex>
      <svg
        viewBox="0 0 500 160"
        className={metricsSvg}
        role="img"
        aria-label="Voter participation across recent proposals"
      >
        <line
          x1={PADDING_X}
          x2={WIDTH - PADDING_X}
          y1={PADDING_Y}
          y2={PADDING_Y}
          stroke={vars.color.text3}
          strokeDasharray="4 4"
        />
        <Text
          as="text"
          variant="eyebrow"
          x={PADDING_X}
          y={PADDING_Y - 4}
          style={{ fill: vars.color.text2 }}
        >
          100%
        </Text>
        {entries.map((entry, i) => {
          const rawHeight = (Math.min(entry.participationPct, 100) / 100) * chartHeight
          const height = entry.votesCast > 0 && rawHeight < 2 ? 2 : rawHeight
          const x = PADDING_X + i * (barWidth + BAR_GAP)
          const y = PADDING_Y + chartHeight - height
          return (
            <rect
              key={i}
              data-testid="participation-bar"
              rx={2}
              x={x}
              y={y}
              width={barWidth}
              height={height}
              fill={i === safeIndex ? vars.color.text1 : vars.color.text3}
              style={{ transition: 'fill 0.2s' }}
              onMouseEnter={() => setActiveIndex(i)}
              onTouchStart={() => setActiveIndex(i)}
            />
          )
        })}
        <line
          x1={PADDING_X}
          x2={WIDTH - PADDING_X}
          y1={PADDING_Y + chartHeight}
          y2={PADDING_Y + chartHeight}
          stroke={vars.color.border}
        />
      </svg>
      <Flex justify="space-between" mt="x1">
        <Text fontSize={12} color="text3">
          Prop #{entries[0].proposalNumber}
        </Text>
        <Text fontSize={12} color="text3">
          Prop #{entries[entries.length - 1].proposalNumber}
        </Text>
      </Flex>
    </Flex>
  )
}

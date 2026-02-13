import {
  calculateStreamedAmountLD,
  calculateStreamedAmountLL,
  Segment,
} from '@buildeross/utils/sablier'
import { Text } from '@buildeross/zord'
import React, { useCallback, useMemo } from 'react'
import { formatUnits } from 'viem'

import { BaseGraph, GRAPH_PADDING_X, GRAPH_PADDING_Y, GraphDataPoint } from './BaseGraph'

interface StreamGraphProps {
  depositAmount: bigint
  decimals: number
  symbol: string
  startTime: number
  endTime: number
  cliffTime?: number
  exponent?: number
  height?: number
  width?: number
  unlockStart?: bigint
  unlockCliff?: bigint
}

const POINTS_COUNT_REGULAR = 100
const POINTS_COUNT_FRONTLOADED = 200 // More points for frontloaded curves

/**
 * Generate timestamp samples with non-uniform distribution
 * For frontloaded curves (exp < 1), concentrate more points at the beginning
 * For backloaded curves (exp > 1), use uniform distribution
 */
function generateTimestamps(
  startTime: number,
  duration: number,
  pointsCount: number,
  exponent?: number
): number[] {
  const timestamps: number[] = []
  const isFrontloaded = exponent !== undefined && exponent < 1 && exponent > 0

  for (let i = 0; i <= pointsCount; i++) {
    let progress: number

    if (isFrontloaded) {
      // For frontloaded curves, use quadratic distribution to concentrate points at start
      // This ensures we capture the rapid initial change
      const linearProgress = i / pointsCount
      progress = 1 - Math.pow(1 - linearProgress, 2) // More points early, fewer later
    } else {
      // For backloaded curves, uniform distribution is fine
      progress = i / pointsCount
    }

    timestamps.push(Math.floor(startTime + duration * progress))
  }

  return timestamps
}

/**
 * Format value with dynamic decimal precision based on magnitude
 * Shows more decimals for smaller values to maintain readability
 */
const formatDynamicDecimals = (value: number): string => {
  if (value === 0) return '0'

  const absValue = Math.abs(value)

  // For very small values, show more decimals
  if (absValue < 0.0001) return value.toFixed(8)
  if (absValue < 0.001) return value.toFixed(6)
  if (absValue < 0.01) return value.toFixed(5)
  if (absValue < 1) return value.toFixed(4)

  // For larger values, show fewer decimals
  if (absValue < 100) return value.toFixed(3)
  if (absValue < 10000) return value.toFixed(2)

  // For very large values, show minimal decimals
  return value.toFixed(1)
}

/**
 * StreamGraph component that visualizes token streaming over time
 * Supports both linear (LockupLinear) and exponential (LockupDynamic) curves
 */
export const StreamGraph: React.FC<StreamGraphProps> = ({
  depositAmount,
  decimals,
  symbol,
  startTime,
  endTime,
  cliffTime = 0,
  exponent,
  height = 220,
  width = 500,
  unlockStart = 0n,
  unlockCliff = 0n,
}) => {
  // Generate data points for the graph
  const data = useMemo(() => {
    const points: GraphDataPoint[] = []
    const duration = endTime - startTime

    if (duration <= 0) {
      return points
    }

    // Use more points for frontloaded curves to capture rapid initial changes
    const isFrontloaded = exponent !== undefined && exponent < 1 && exponent > 0
    const pointsCount = isFrontloaded ? POINTS_COUNT_FRONTLOADED : POINTS_COUNT_REGULAR

    // Generate timestamps with appropriate distribution
    const timestamps = generateTimestamps(startTime, duration, pointsCount, exponent)

    for (const timestamp of timestamps) {
      let streamedAmount: bigint

      // Use exponential calculation for any valid exponent (supports both > 1 and < 1)
      const isExponential = exponent !== undefined && exponent > 0

      if (isExponential && exponent) {
        // Build segments for exponential calculation
        // Single segment with full amount at endTime
        const segments: Segment[] = [
          {
            timestamp: endTime,
            amount: depositAmount,
            exponent: exponent,
          },
        ]

        streamedAmount = calculateStreamedAmountLD({
          depositedAmount: depositAmount,
          endTime: endTime,
          segments: segments,
          startTime: startTime,
          withdrawnAmount: 0n,
          now: timestamp,
        })
      } else {
        // Linear stream calculation
        streamedAmount = calculateStreamedAmountLL({
          now: timestamp,
          cliffTime: cliffTime,
          depositedAmount: depositAmount,
          endTime: endTime,
          startTime: startTime,
          unlockStart: unlockStart,
          unlockCliff: unlockCliff,
          withdrawnAmount: 0n,
        })
      }

      // Convert to decimal for display
      const streamedDecimal = Number(formatUnits(streamedAmount, decimals))

      points.push({
        x: timestamp,
        y: streamedDecimal,
      })
    }

    return points
  }, [
    depositAmount,
    decimals,
    startTime,
    endTime,
    cliffTime,
    exponent,
    unlockStart,
    unlockCliff,
  ])

  const renderTooltip = useCallback(
    (index: number, data: GraphDataPoint[], cursorOpacity: number) => {
      if (data.length === 0) return null

      const point = data[index]
      // Use same padding constants as BaseGraph for consistent positioning
      const chartWidth = width - GRAPH_PADDING_X * 2
      const chartHeight = height - GRAPH_PADDING_Y * 2
      const parts = data.length
      // Calculate max Y value, handling small values (e.g., 0.01 ETH) properly
      // Use reduce instead of spread operator for performance with large arrays
      const maxY = data.reduce((max, p) => (p.y > max ? p.y : max), 0)
      const maximumY = maxY > 0 ? maxY : 1

      // Calculate position with text offset for better visual alignment
      const TEXT_OFFSET = 12
      const x =
        index * (chartWidth / Math.max(1, parts - 1)) + GRAPH_PADDING_X - TEXT_OFFSET
      const y =
        chartHeight - (point.y / maximumY) * chartHeight + GRAPH_PADDING_Y - TEXT_OFFSET

      // Format timestamp as date
      const timestamp = new Date(point.x * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

      return (
        <>
          <Text
            style={{ transition: 'opacity 0.5s', opacity: cursorOpacity }}
            fontSize={{ '@initial': 20, '@768': 16 }}
            key={`${index}-amount`}
            as="text"
            variant="eyebrow"
            x={x}
            y={y - 10}
            backgroundColor={'accent'}
          >
            {formatDynamicDecimals(point.y)} {symbol}
          </Text>
          <Text
            style={{ transition: 'opacity 0.5s', opacity: cursorOpacity }}
            fontSize={{ '@initial': 16, '@768': 12 }}
            key={`${index}-date`}
            as="text"
            variant="eyebrow"
            x={x}
            y={y - 28}
            backgroundColor={'accent'}
          >
            {timestamp}
          </Text>
        </>
      )
    },
    [width, height, symbol]
  )

  if (data.length === 0) {
    return null
  }

  return (
    <BaseGraph height={height} width={width} data={data} renderTooltip={renderTooltip} />
  )
}

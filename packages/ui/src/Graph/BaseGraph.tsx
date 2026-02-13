import { Box, color } from '@buildeross/zord'
import React, { useEffect, useId, useMemo, useRef, useState } from 'react'

import { graphOnLoadStyles, svgBox } from './Graph.css'
import {
  calculateVisibleIndex,
  calculateX,
  getMouseEventSource,
  getTouchEventSource,
  isTouchEvent,
} from './utils'

const STROKE = 1

// Exported padding constants for consistent positioning in tooltip calculations
export const GRAPH_PADDING_X = 10
export const GRAPH_PADDING_Y = 30

export interface GraphDataPoint {
  x: number
  y: number
}

interface BaseGraphProps {
  height?: number
  width?: number
  data: GraphDataPoint[]
  renderTooltip?: (
    index: number,
    data: GraphDataPoint[],
    cursorOpacity: number
  ) => React.ReactNode
  strokeColor?: string
  animationKey?: string | number
}

export const BaseGraph: React.FC<BaseGraphProps> = ({
  height = 220,
  width = 500,
  data,
  renderTooltip,
  strokeColor = color.accent,
  animationKey,
}) => {
  const [visibleIndex, setVisibleIndex] = useState(0)
  const [cursorOpacity, setCursorOpacity] = useState(0)
  const chartWidth = width - GRAPH_PADDING_X * 2
  const chartHeight = height - GRAPH_PADDING_Y * 2

  const lineRef = useRef<SVGPolylineElement | null>(null)
  const filterId = useId()

  // Keep visibleIndex in bounds when data changes
  useEffect(() => {
    if (data.length === 0) {
      setVisibleIndex(0)
    } else {
      setVisibleIndex((currentIndex) => Math.min(currentIndex, data.length - 1))
    }
  }, [data.length])

  // Calculate maximum Y value for normalization
  // Start from 0 to properly handle small values (e.g., 0.01 ETH)
  const maximumY = useMemo(() => {
    if (data.length === 0) return 1
    const max = data.reduce((max, point) => (point.y > max ? point.y : max), 0)
    // Fallback to 1 only if all values are zero or negative
    return max > 0 ? max : 1
  }, [data])

  // Generate SVG points string
  const points = useMemo(() => {
    if (data.length === 0) return ''

    return data
      .map((point, index) => {
        const parts = data.length
        const x = index * (chartWidth / Math.max(1, parts - 1)) + GRAPH_PADDING_X
        const y = chartHeight - (point.y / maximumY) * chartHeight + GRAPH_PADDING_Y

        return `${x},${y}`
      })
      .join(' ')
  }, [data, chartWidth, chartHeight, maximumY])

  // Animation effect for line drawing
  useEffect(() => {
    if (!lineRef.current) return

    const length = lineRef.current.getTotalLength()
    lineRef.current.style.strokeDasharray = `${length} ${length}`
    lineRef.current.style.strokeDashoffset = length.toString()
    lineRef.current.style.opacity = '0'

    const timerId = setTimeout(() => {
      if (lineRef.current) {
        lineRef.current.style.transition =
          'stroke-dashoffset 1.5s ease-in-out, opacity 1.5s ease-in-out'
        lineRef.current.style.strokeDashoffset = '0'
        lineRef.current.style.opacity = '1'
      }
    }, 100)

    return () => {
      clearTimeout(timerId)
    }
  }, [animationKey, data.length, points])

  // Mouse/touch event handlers
  const handleMouseMove = (
    e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
  ) => {
    if (cursorOpacity === 0) {
      setCursorOpacity(1)
    }
    const event = isTouchEvent(e) ? getTouchEventSource(e) : getMouseEventSource(e)
    if (!event) return // Guard against undefined touch events

    const x = calculateX(event, e, GRAPH_PADDING_X)
    const newIndex = calculateVisibleIndex(x, e, GRAPH_PADDING_X, data.length)

    setVisibleIndex(newIndex)
  }

  const handleMouseLeaveOrTouchEnd = () => {
    setCursorOpacity(0)
  }

  const handleMouseEnterOrTouchStart = () => {
    setCursorOpacity(1)
  }

  if (data.length === 0) {
    return null
  }

  const currentPoint = data[visibleIndex]
  // Defensive check: if currentPoint is undefined (array shrunk), use first point as fallback
  const safePoint = currentPoint || data[0]
  const currentX =
    visibleIndex * (chartWidth / Math.max(1, data.length - 1)) + GRAPH_PADDING_X
  const currentY = chartHeight - (safePoint.y / maximumY) * chartHeight + GRAPH_PADDING_Y

  // Combine base opacity with cursor opacity for vertical guide line
  const baseOpacity = 0.2
  const lineOpacity = baseOpacity * cursorOpacity

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      onTouchMove={handleMouseMove}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeaveOrTouchEnd}
      onMouseEnter={handleMouseEnterOrTouchStart}
      onTouchEnd={handleMouseLeaveOrTouchEnd}
      onTouchStart={handleMouseEnterOrTouchStart}
      className={svgBox}
    >
      <defs>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation=".25" />
        </filter>
      </defs>

      {/* Tooltip */}
      {renderTooltip && renderTooltip(visibleIndex, data, cursorOpacity)}

      {/* Cursor circle */}
      <Box
        as="circle"
        cx={currentX}
        cy={currentY}
        r="3"
        fill={strokeColor}
        style={{ transition: 'opacity 0.5s', opacity: cursorOpacity }}
      />

      {/* Vertical cursor line */}
      <line
        stroke={strokeColor}
        strokeWidth={STROKE}
        x1={currentX}
        x2={currentX}
        y1="0"
        y2={chartHeight + GRAPH_PADDING_Y}
        style={{ transition: 'opacity 0.5s', opacity: lineOpacity }}
      />

      {/* Main graph line */}
      <polyline
        key={animationKey ?? 'default'}
        ref={lineRef}
        fill="none"
        stroke={strokeColor}
        strokeWidth={STROKE}
        points={points}
        className={graphOnLoadStyles}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={`url(#${filterId})`}
      />
    </svg>
  )
}

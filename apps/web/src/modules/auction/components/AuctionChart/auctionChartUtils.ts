import React from 'react'

export const isTouchEvent = (
  e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
): e is React.TouchEvent<SVGSVGElement> => 'touches' in e

export const getMouseEventSource = (
  e: React.MouseEvent<SVGSVGElement>
): React.MouseEvent<SVGSVGElement> => e

export const getTouchEventSource = (e: React.TouchEvent<SVGSVGElement>): React.Touch =>
  e.touches[0]

export const calculateY = (
  event: { clientX: number; pageX?: number },
  e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>,
  paddingX: number
): number =>
  Math.max(0, event.clientX - e.currentTarget.getBoundingClientRect().left - paddingX)

export const calculateVisibleIndex = (
  y: number,
  e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>,
  paddingY: number,
  chartDataLength: number
): number => {
  const index = Math.round(
    ((y - paddingY / 2) / (e.currentTarget.getBoundingClientRect().width - paddingY)) *
      chartDataLength
  )
  return Math.max(0, Math.min(index, chartDataLength - 1))
}

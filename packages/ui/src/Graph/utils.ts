import React from 'react'

export const isTouchEvent = (
  e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
): e is React.TouchEvent<SVGSVGElement> => 'touches' in e

export const getMouseEventSource = (
  e: React.MouseEvent<SVGSVGElement>
): React.MouseEvent<SVGSVGElement> => e

export const getTouchEventSource = (
  e: React.TouchEvent<SVGSVGElement>
): React.Touch | undefined => e.touches[0] || e.changedTouches[0]

export const calculateX = (
  event: { clientX: number; pageX?: number },
  e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>,
  paddingX: number
): number =>
  Math.max(0, event.clientX - e.currentTarget.getBoundingClientRect().left - paddingX)

export const calculateVisibleIndex = (
  x: number,
  e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>,
  paddingX: number,
  chartDataLength: number
): number => {
  const index = Math.round(
    ((x - paddingX / 2) / (e.currentTarget.getBoundingClientRect().width - paddingX)) *
      chartDataLength
  )
  return Math.max(0, Math.min(index, chartDataLength - 1))
}

import { skeletonAnimation } from '@buildeross/ui/styles'
import { style } from '@vanilla-extract/css'

export const metricsSkeleton = style({
  animation: skeletonAnimation,
  height: '160px',
})

export const metricsSvg = style({
  width: '100%',
  height: 'auto',
  overflow: 'visible',
})

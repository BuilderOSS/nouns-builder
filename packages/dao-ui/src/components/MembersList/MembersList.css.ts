import { skeletonAnimation } from '@buildeross/ui/styles'
import { style } from '@vanilla-extract/css'

export const row = style({
  width: '100%',
})

export const identityColumn = style({
  width: '100%',
  '@media': {
    'screen and (min-width: 768px)': {
      width: '35%',
    },
  },
})

export const cardSkeleton = style({
  width: '100%',
  animation: skeletonAnimation,
  height: '32px',
  '@media': {
    'screen and (max-width: 768px)': {
      height: '67px',
    },
  },
})

import { style } from '@vanilla-extract/css'
import { skeletonAnimation } from 'src/styles/animations.css'

export const row = style({
  width: '100%',
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

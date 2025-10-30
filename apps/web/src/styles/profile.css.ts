import { skeletonAnimation } from '@buildeross/ui/styles'
import { color } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const loadingSkeleton = style({
  animation: skeletonAnimation,
})

export const daosContainer = style({
  width: '100%',
  '@media': {
    'screen and (min-width: 768px)': {
      width: '360px',
      flexShrink: 0,
    },
  },
})

export const tokenContainer = style({
  width: '100%',
  overflow: 'auto',
  '@media': {
    'screen and (min-width: 768px)': {
      flex: 1,
      overflowY: 'auto',
      height: '100%',
    },
  },
})

export const noTokensContainer = style({
  height: '40vh',
  '@media': {
    'screen and (min-width: 768px)': {
      height: '65vh',
    },
  },
})

export const responsiveGrid = style({
  gridTemplateColumns: '1fr',
  '@media': {
    '(min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
    '(min-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr 1fr',
    },
  },
})

export const profileDaoLink = style({
  backgroundColor: color.background1,
  selectors: {
    '&:hover': {
      backgroundColor: color.background2,
    },
  },
})

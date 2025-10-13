import { skeletonAnimation } from '@buildeross/ui/styles'
import { atoms, media } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const daoFeedSkeleton = style({
  animation: skeletonAnimation,
  height: '390px',
})

export const emptyTile = style({
  borderRadius: 12,
  minHeight: 540,
  backgroundColor: '#F9F9F9',
  selectors: {
    '&:first-child': {
      display: 'none',
    },
    '&:last-child': {
      display: 'none',
    },
  },
  '@media': {
    [media.min768]: {
      selectors: {
        '&:first-child': {
          display: 'block',
        },
        '&:last-child': {
          display: 'block',
        },
      },
    },
  },
})

export const daoFeedGrid = style([
  atoms({
    gap: 'x3',
    w: '100%',
  }),
  {
    maxWidth: 'calc(1440px - 2 * 32px)',
    '@media': {
      'screen and (min-width: 1024px)': {
        gridTemplateColumns: 'repeat(3, 33.33%)',
      },
      'screen and (min-width: 600px) and (max-width: 1023px)': {
        gridTemplateColumns: 'repeat(2, 50%)',
      },
      'screen and (max-width: 600px)': {
        gridTemplateColumns: 'repeat(1, 100%)',
      },
    },
  },
])

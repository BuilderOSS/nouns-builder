import { skeletonAnimation } from '@buildeross/ui/styles'
import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const exploreSkeleton = style({
  animation: skeletonAnimation,
  height: '390px',
})

export const exploreGrid = style([
  atoms({
    gap: 'x4',
    mb: 'x4',
    w: '100%',
  }),
  {
    maxWidth: 912,
    '@media': {
      'screen and (min-width: 1024px)': {
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr));',
      },
      'screen and (min-width: 600px) and (max-width: 1023px)': {
        maxWidth: 660,
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr));',
      },
      'screen and (max-width: 600px)': {
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      },
    },
  },
])

export const searchContainer = style([
  atoms({
    w: '100%',
  }),
  {
    maxWidth: 912,
    '@media': {
      'screen and (min-width: 1024px)': {},
      'screen and (min-width: 600px) and (max-width: 1023px)': {
        maxWidth: 660,
      },
      'screen and (max-width: 600px)': {},
    },
  },
])

import { style } from '@vanilla-extract/css'
import { atoms } from '@zoralabs/zord'

export const exploreGrid = style([
  atoms({
    gap: 'x4',
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

import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const galleryContainer = style([
  atoms({
    m: 'auto',
  }),
  {
    maxWidth: 912,
  },
])

export const galleryGrid = style([
  atoms({
    gap: 'x4',
  }),
  {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    '@media': {
      'screen and (min-width: 600px) and (max-width: 1023px)': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
      'screen and (max-width: 600px)': {
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      },
    },
  },
])

export const creatorCoinSection = style([
  atoms({
    p: 'x6',
    borderRadius: 'curved',
    backgroundColor: 'background2',
    mb: 'x6',
  }),
])

export const emptyState = style([
  atoms({
    textAlign: 'center',
    py: 'x10',
    color: 'text3',
  }),
])

import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const gridStyle = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  '@media': {
    'screen and (min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
})

export const linkStyle = style({
  textDecoration: 'none',
  display: 'inline-block',
  width: 'fit-content',
})

export const itemContent = style({
  '@media': {
    '(min-width: 768px)': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
  },
})

export const itemMedia = style([
  atoms({
    borderRadius: 'curved',
    overflow: 'hidden',
    w: '100%',
  }),
  {
    objectFit: 'cover',
    '@media': {
      '(min-width: 768px)': {
        width: '50%',
        flexShrink: 0,
      },
    },
  },
])

export const itemImage = style([
  atoms({
    borderRadius: 'curved',
    backgroundColor: 'border',
    overflow: 'hidden',
    w: '100%',
  }),
  {
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    '@media': {
      '(min-width: 768px)': {
        width: '50%',
        flexShrink: 0,
      },
    },
  },
])

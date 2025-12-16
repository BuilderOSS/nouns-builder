import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const headerContainer = style([
  atoms({
    w: '100%',
    backgroundColor: 'background1',
  }),
  {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    maxWidth: '872px',
    margin: '0 auto',
  },
])

export const headerContent = style([
  atoms({
    px: 'x6',
    py: 'x4',
  }),
  {
    maxWidth: '1200px',
    margin: '0 auto',
    '@media': {
      'screen and (max-width: 768px)': {
        flexWrap: 'wrap',
        gap: '16px',
      },
    },
  },
])

export const daoImageStyle = style([
  atoms({
    borderRadius: 'curved',
  }),
  {
    width: '48px',
    height: '48px',
    objectFit: 'cover',
  },
])

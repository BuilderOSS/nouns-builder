import { atoms, media } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const onlyDesktop = style({
  '@media': {
    'screen and (max-width: 1023px)': {
      display: 'none',
    },
  },
})

export const dropDetailContainer = style([
  atoms({
    m: 'auto',
    px: { '@initial': 'x0', '@1024': 'x6' },
    py: { '@initial': 'x0', '@1024': 'x6' },
  }),
  {
    maxWidth: 1200,
    '@media': {
      'screen and (max-width: 1024px)': {
        paddingBottom: '108px',
      },
    },
  },
])

export const dropDetailLayout = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '32px',
  '@media': {
    [media.min1024]: {
      gridTemplateColumns: '1fr 1fr',
    },
  },
})

export const dropInfoPanel = style([
  atoms({
    p: 'x6',
    borderRadius: 'curved',
    backgroundColor: 'background2',
  }),
])

export const mintPanel = style([
  atoms({
    borderRadius: 'curved',
  }),
  {
    '@media': {
      [media.min1024]: {
        position: 'sticky',
        alignSelf: 'flex-start',
        transition: 'top 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
])

export const dropHeader = style([
  atoms({
    mb: 'x6',
  }),
])

export const dropImageContainer = style({
  width: 120,
  height: 120,
  borderRadius: 12,
  overflow: 'hidden',
  flexShrink: 0,
})

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 24,
  '@media': {
    'screen and (max-width: 600px)': {
      gridTemplateColumns: '1fr',
      gap: 16,
    },
  },
})

export const mintPanelDesktopOnly = style({
  '@media': {
    'screen and (max-width: 1023px)': {
      display: 'none',
    },
  },
})

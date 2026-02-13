import { atoms, media } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const coinDetailContainer = style([
  atoms({
    m: 'auto',
    px: { '@initial': 'x4', '@768': 'x6' },
    py: 'x8',
  }),
  {
    maxWidth: 1200,
  },
])

export const coinDetailLayout = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '32px',
  '@media': {
    [media.min1024]: {
      gridTemplateColumns: '1fr 1fr',
    },
  },
})

export const coinInfoPanel = style([
  atoms({
    p: 'x6',
    borderRadius: 'curved',
    backgroundColor: 'background2',
  }),
])

export const swapPanel = style([
  atoms({
    p: 'x6',
    borderRadius: 'curved',
    backgroundColor: 'background2',
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

export const coinHeader = style([
  atoms({
    mb: 'x6',
  }),
])

export const coinImageContainer = style({
  width: 120,
  height: 120,
  borderRadius: 12,
  overflow: 'hidden',
  flexShrink: 0,
})

export const stat = style([
  atoms({
    mb: 'x4',
  }),
])

export const backLink = style([
  atoms({
    mb: 'x4',
  }),
  {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
    ':hover': {
      opacity: 0.7,
    },
  },
])

export const swapInputContainer = style([
  atoms({
    p: 'x4',
    borderRadius: 'phat',
    backgroundColor: 'background1',
  }),
])

export const swapInput = style({
  fontSize: '1.5rem',
  fontWeight: 500,
  border: 'none',
  backgroundColor: 'transparent',
  ':focus': {
    outline: 'none',
  },
})

export const swapButton = style({
  fontSize: '1rem',
  fontWeight: 600,
})

export const maxButton = style([
  atoms({
    px: 'x3',
    py: 'x2',
    borderRadius: 'curved',
  }),
  {
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
])

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 24,
  '@media': {
    'screen and (max-width: 600px)': {
      gridTemplateColumns: '1fr',
      gap: 16,
    },
  },
})

export const sectionDivider = style([
  atoms({
    my: 'x6',
  }),
  {
    height: 1,
    backgroundColor: 'var(--border)',
  },
])

export const linksContainer = style({
  flexWrap: 'wrap',
})

export const swapPanelDesktopOnly = style({
  '@media': {
    'screen and (max-width: 1023px)': {
      display: 'none',
    },
  },
})

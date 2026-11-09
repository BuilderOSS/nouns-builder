import { skeletonAnimation } from '@buildeross/ui/styles'
import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const exploreSkeleton = style({
  animation: skeletonAnimation,
  height: '390px',
})

// Responsive skeleton visibility
export const skeletonTabletAndUp = style({
  '@media': {
    'screen and (max-width: 600px)': {
      display: 'none',
    },
  },
})

export const skeletonDesktopOnly = style({
  '@media': {
    'screen and (max-width: 1023px)': {
      display: 'none',
    },
  },
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

// Link from the DAO search to the global search page. The top margin clears the
// search input's absolutely positioned helper text ("Press Enter to search").
export const globalSearchCta = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  marginTop: 32,
  padding: '14px 16px',
  borderRadius: 12,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.background2,
  color: vars.color.text1,
  fontSize: 15,
  fontWeight: 500,
  textDecoration: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.1s ease-in-out, background 0.1s ease-in-out',
  selectors: {
    '&:hover': {
      borderColor: vars.color.text3,
      background: vars.color.neutralHover,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: 2,
    },
  },
})

export const globalSearchCtaText = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
})

const singleLine = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const

export const globalSearchCtaTitle = style(singleLine)

export const globalSearchCtaHint = style({
  ...singleLine,
  fontSize: 13,
  fontWeight: 400,
  color: vars.color.text3,
})

import { style } from '@vanilla-extract/css'

export const sidebar = style({
  width: '100%',
  '@media': {
    '(min-width: 1024px)': {
      position: 'relative',
      maxWidth: 360,
    },
    '(min-width: 1280px)': {
      maxWidth: 480,
    },
  },
})

export const desktopOnly = style({
  display: 'none',
  '@media': {
    '(min-width: 1024px)': {
      display: 'flex',
    },
  },
})

export const desktopLayout = style({
  display: 'none',
  '@media': {
    '(min-width: 1024px)': {
      display: 'flex',
    },
  },
})

export const mobileLayout = style({
  display: 'block',
  paddingBottom: '80px', // Space for bottom nav
  '@media': {
    '(min-width: 1024px)': {
      display: 'none',
    },
  },
})

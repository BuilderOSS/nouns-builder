import { atoms, color } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const headerContainer = style([
  atoms({
    backgroundColor: 'background1',
    position: 'sticky',
  }),
  {
    top: 0,
    zIndex: 50,
    borderBottom: '1px solid',
    borderBottomColor: color.border,
  },
])

export const logoSection = style([
  atoms({
    cursor: 'pointer',
    textDecoration: 'none',
  }),
  {
    transition: 'opacity 0.2s ease',
    ':hover': {
      opacity: 0.8,
    },
  },
])

export const navLinks = style([
  {
    gap: '16px',
    '@media': {
      'screen and (max-width: 768px)': {
        display: 'none',
      },
    },
  },
])

export const mobileMenuButton = style([
  atoms({
    cursor: 'pointer',
    borderRadius: 'round',
    backgroundColor: 'background2',
    display: 'none',
  }),
  {
    width: '40px',
    height: '40px',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 103,
    '@media': {
      'screen and (max-width: 768px)': {
        display: 'flex',
      },
    },
  },
])

export const mobileMenuOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 100,
})

export const mobileMenuContent = style([
  atoms({
    backgroundColor: 'background1',
    borderRadius: 'phat',
    position: 'fixed',
  }),
  {
    top: '80px',
    right: '16px',
    zIndex: 101,
    minWidth: '200px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
])

export const navLink = style([
  atoms({
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'text2',
  }),
  {
    transition: 'all 0.2s ease',
    borderBottom: '2px solid transparent',
    paddingBottom: '2px',
    ':hover': {
      color: color.text1,
    },
  },
])

export const navLinkActive = style([
  atoms({
    color: 'text1',
  }),
  {
    borderBottomColor: color.accent,
  },
])

export const connectButtonWrapper = style({
  '@media': {
    'screen and (max-width: 768px)': {
      display: 'none',
    },
  },
})

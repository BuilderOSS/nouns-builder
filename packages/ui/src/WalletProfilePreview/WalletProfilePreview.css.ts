import { atoms, theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const profileHeaderLink = style([
  atoms({
    borderRadius: 'curved',
    p: 'x2',
    mb: 'x2',
    alignItems: 'center',
    gap: 'x2',
  }),
  {
    color: 'inherit',
    textDecoration: 'none',
    transition: 'background-color 0.15s ease',
    ':hover': {
      backgroundColor: theme.colors.background2,
    },
    ':focus-visible': {
      outline: `2px solid ${theme.colors.accent}`,
      outlineOffset: '2px',
    },
  },
])

export const daoLink = style([
  atoms({
    borderRadius: 'curved',
    p: 'x1',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  {
    textDecoration: 'none',
    transition: 'background-color 0.15s ease',
    ':hover': {
      backgroundColor: theme.colors.background2,
    },
    ':focus-visible': {
      outline: `2px solid ${theme.colors.accent}`,
      outlineOffset: '2px',
    },
  },
])

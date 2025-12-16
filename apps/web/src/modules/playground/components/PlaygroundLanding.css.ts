import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const landingContainer = style([
  atoms({
    w: '100%',
    px: 'x6',
    py: 'x10',
  }),
  {
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
  },
])

export const landingTitle = style([
  atoms({
    fontSize: 35,
    fontWeight: 'display',
    textAlign: 'center',
  }),
  {
    '@media': {
      'screen and (max-width: 768px)': {
        fontSize: '28px',
      },
    },
  },
])

export const landingDescription = style([
  atoms({
    textAlign: 'center',
    color: 'text3',
  }),
  {
    maxWidth: '600px',
  },
])

export const cardsContainer = style([
  atoms({
    w: '100%',
  }),
  {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    maxWidth: '900px',
    '@media': {
      'screen and (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '16px',
      },
    },
  },
])

export const card = style([
  atoms({
    p: 'x8',
    borderRadius: 'curved',
    backgroundColor: 'background2',
  }),
  {
    border: 'none',
    textAlign: 'left',
    font: 'inherit',
    cursor: 'pointer',
    outline: '2px solid transparent',
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    minHeight: '240px',
    ':hover': {
      outlineColor: 'var(--zord-colors-border-primary)',
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    },
    ':focus-visible': {
      outlineColor: 'var(--zord-colors-border-primary)',
      outlineOffset: '2px',
    },
  },
])

export const cardIcon = style({
  fontSize: '48px',
})

export const cardTitle = style([
  atoms({
    fontSize: 20,
    fontWeight: 'display',
    textAlign: 'center',
  }),
])

export const cardDescription = style([
  atoms({
    textAlign: 'center',
    color: 'text3',
    fontSize: 14,
  }),
])

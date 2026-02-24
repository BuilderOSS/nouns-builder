import { atoms, color, theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const dropsContainer = style([
  atoms({
    m: 'auto',
  }),
  {
    maxWidth: 912,
  },
])

export const dropsGrid = style([
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

export const card = style([
  {
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: `2px solid ${color.border}`,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${theme.colors.ghostHover}`,
    },
  },
])

export const coinImage = style({
  transition: 'transform 0.3s ease',
  selectors: {
    [`${card}:hover &`]: {
      transform: 'scale(1.05)',
    },
  },
})

export const coinInfo = style([
  atoms({
    px: 'x4',
    pb: 'x4',
  }),
])

export const emptyState = style([
  atoms({
    textAlign: 'center',
    py: 'x10',
    color: 'text3',
  }),
])

export const headerSection = style([
  atoms({
    mb: 'x6',
  }),
])

export const createDropBtn = style({
  fontWeight: 700,
})

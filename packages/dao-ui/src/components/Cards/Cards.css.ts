import { atoms, color, theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

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

export const tradeButtonContainer = style({
  marginTop: 8,
})

export const typeBadge = style({
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 10,
})

export const creatorCoinSection = style([
  atoms({
    p: 'x6',
    borderRadius: 'curved',
    backgroundColor: 'background2',
    mb: 'x6',
  }),
])

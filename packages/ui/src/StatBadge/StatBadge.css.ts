import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const statBadgeBase = style([
  atoms({
    px: 'x2',
    py: 'x1',
    borderRadius: 'curved',
  }),
  {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.75rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
])

export const statBadgeDefault = style([
  statBadgeBase,
  atoms({
    backgroundColor: 'background2',
    color: 'text2',
  }),
])

export const statBadgePositive = style([
  statBadgeBase,
  atoms({
    backgroundColor: 'positiveHover',
    color: 'positive',
  }),
])

export const statBadgeNegative = style([
  statBadgeBase,
  atoms({
    backgroundColor: 'negativeHover',
    color: 'negative',
  }),
])

export const statBadgeAccent = style([
  statBadgeBase,
  atoms({
    backgroundColor: 'accentHover',
    color: 'accent',
  }),
])

import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const transactionDiffAdded = style([
  atoms({
    borderWidth: 'normal',
    borderRadius: 'curved',
    backgroundColor: 'background2',
  }),
  {
    borderStyle: 'solid',
    borderColor: vars.color.positive,
    borderLeftWidth: '4px',
  },
])

export const transactionDiffRemoved = style([
  atoms({
    borderWidth: 'normal',
    borderRadius: 'curved',
    backgroundColor: 'background2',
  }),
  {
    borderStyle: 'solid',
    borderColor: vars.color.negative,
    borderLeftWidth: '4px',
    opacity: 0.7,
  },
])

export const transactionDiffChanged = style([
  atoms({
    borderWidth: 'normal',
    borderRadius: 'curved',
    backgroundColor: 'background2',
  }),
  {
    borderStyle: 'solid',
    borderColor: vars.color.accent,
    borderLeftWidth: '4px',
  },
])

export const transactionDiffUnchanged = style([
  atoms({
    borderWidth: 'normal',
    borderRadius: 'curved',
    backgroundColor: 'background2',
    borderColor: 'border',
  }),
  {
    borderStyle: 'solid',
    opacity: 0.8,
  },
])

export const diffBadge = style([
  atoms({
    borderRadius: 'small',
    px: 'x2',
    py: 'x1',
  }),
  {
    fontSize: '12px',
    fontWeight: 500,
  },
])

export const diffBadgeAdded = style({
  backgroundColor: vars.color.positive,
  color: vars.color.onPositive,
})

export const diffBadgeRemoved = style({
  backgroundColor: vars.color.negative,
  color: vars.color.onNegative,
})

export const diffBadgeChanged = style({
  backgroundColor: vars.color.accent,
  color: vars.color.onAccent,
})

export const changedTransactionContainer = style({
  cursor: 'pointer',
})

export const changedTransactionExpanded = style([
  atoms({
    p: 'x4',
    borderRadius: 'curved',
    backgroundColor: 'background1',
  }),
])

export const transactionDiffWrapper = style({
  position: 'relative',
})

import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const diffContainer = style([
  atoms({
    p: 'x4',
    borderRadius: 'curved',
    borderWidth: 'thin',
    borderColor: 'border',
    backgroundColor: 'background1',
  }),
  {
    fontFamily: 'monospace',
    fontSize: '14px',
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
])

export const diffLineAdded = style({
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  paddingLeft: '8px',
  paddingRight: '8px',
})

export const diffLineRemoved = style({
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  paddingLeft: '8px',
  paddingRight: '8px',
})

export const diffLineUnchanged = style({
  backgroundColor: 'transparent',
  paddingLeft: '8px',
  paddingRight: '8px',
})

export const diffTextAdded = style({
  fontFamily: 'monospace',
  fontSize: '14px',
  color: vars.color.positive,
})

export const diffTextRemoved = style({
  fontFamily: 'monospace',
  fontSize: '14px',
  color: vars.color.negative,
})

export const diffTextUnchanged = style({
  fontFamily: 'monospace',
  fontSize: '14px',
  color: vars.color.text1,
})

export const tabButton = style({
  borderRadius: 0,
  paddingBottom: '12px',
})

export const tabButtonActive = style({
  borderBottom: '2px solid',
})

export const tabButtonInactive = style({
  borderBottom: 'none',
})

export const modalContent = style({
  maxHeight: '600px',
  overflowY: 'auto',
})

export const tabsContainer = style({
  borderBottom: `1px solid ${vars.color.border}`,
})

export const updateMessageBox = style([
  atoms({
    p: 'x4',
    borderRadius: 'curved',
    borderWidth: 'thin',
    borderColor: 'border',
    backgroundColor: 'background2',
  }),
])

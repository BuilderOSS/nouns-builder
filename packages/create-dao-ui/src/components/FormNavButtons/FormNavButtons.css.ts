import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const formNavResetButton = style({
  marginRight: 8,
})

export const formNavContinueButton = style({
  borderRadius: 10,
  height: 60,
  marginLeft: 8,
})

export const formNavMobileBar = style({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 25,
  padding: 16,
  paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
  background: vars.color.background1,
  borderTop: `1px solid ${vars.color.border}`,
  '@media': {
    '(min-width: 768px)': {
      display: 'none',
    },
  },
})

export const formNavMobileBarSpacer = style({
  height: 'calc(92px + env(safe-area-inset-bottom))',
  '@media': {
    '(min-width: 768px)': {
      display: 'none',
    },
  },
})

export const formNavDesktopRow = style({
  display: 'none',
  '@media': {
    '(min-width: 768px)': {
      display: 'block',
    },
  },
})

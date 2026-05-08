import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const animatedPanel = style({
  height: '100vh',
  width: '100vw',
  position: 'fixed',
  background: vars.color.background1,
  top: 0,
  left: 0,
  transform: 'translateY(105%)',
  boxShadow: `0px 12px 30px ${vars.color.backdrop}`,
  zIndex: 1,
})

export const animatedPanelInner = style({
  overflowY: 'scroll',
  height: `calc(100% - 96px)`,
})

export const panelProposalWrapper = style({
  maxWidth: 680,
  width: '100%',
})

export const panelCloseButton = style({
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

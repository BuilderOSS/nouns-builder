import { vars } from '@buildeross/zord'
import { globalStyle, style } from '@vanilla-extract/css'

const darkBridgeHover = vars.color.neutralHover

export const bridgeCardBody = style({
  borderBottomLeftRadius: '0.8rem',
  borderBottomRightRadius: '0.8rem',
  borderBottom: `2px solid ${vars.color.border}`,
  borderLeft: `2px solid ${vars.color.border}`,
  borderRight: `2px solid ${vars.color.border}`,
})

export const bridgeActionButton = style({
  selectors: {
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: `${darkBridgeHover} !important`,
      borderColor: `${darkBridgeHover} !important`,
    },
  },
})

globalStyle(`html[data-theme-mode="dark"] .${bridgeActionButton}:hover svg`, {
  fill: vars.color.text1,
})

globalStyle(`html[data-theme-mode="dark"] .${bridgeActionButton}:hover path`, {
  fill: vars.color.text1,
  stroke: vars.color.text1,
})

globalStyle(`html[data-theme-mode="dark"] .${bridgeActionButton}:hover polyline`, {
  stroke: vars.color.text1,
})

globalStyle(`html[data-theme-mode="dark"] .${bridgeActionButton}:hover line`, {
  stroke: vars.color.text1,
})

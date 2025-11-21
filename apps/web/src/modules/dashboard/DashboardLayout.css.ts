import * as layers from '@buildeross/constants/layers'
import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const sidebar = style({
  width: '100%',
  '@media': {
    '(max-width: 1023px)': {
      position: 'fixed',
      height: 'calc(100vh - 80px)',
      top: 80,
      left: 0,
      right: 0,
      backgroundColor: vars.color.background1,
      padding: vars.space['x6'],
      paddingTop: vars.space['x8'],
      overflowY: 'auto',
      zIndex: layers.DASHBOARD_SIDEBAR_LAYER,
    },
    '(min-width: 1024px)': {
      position: 'relative',
      maxWidth: 360,
    },
    '(min-width: 1280px)': {
      maxWidth: 480,
    },
  },
})

export const sidebarToggle = style({
  display: 'block',
  '@media': {
    '(min-width: 1024px)': {
      display: 'none',
    },
  },
})

export const reversedSidebarToggle = style({
  position: 'absolute',
  top: 24,
  right: 24,
  display: 'block',
  '@media': {
    '(min-width: 1024px)': {
      display: 'none',
    },
  },
})

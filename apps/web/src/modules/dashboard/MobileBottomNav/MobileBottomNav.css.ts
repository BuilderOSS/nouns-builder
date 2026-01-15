import { MOBILE_BOTTOM_NAV_LAYER } from '@buildeross/constants/layers'
import { atoms, color } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const bottomNav = style([
  atoms({
    backgroundColor: 'background1',
    borderColor: 'border',
  }),
  {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'none',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '64px',
    borderTop: '1px solid',
    zIndex: MOBILE_BOTTOM_NAV_LAYER,
    paddingBottom: 'env(safe-area-inset-bottom)',

    '@media': {
      'screen and (max-width: 1023px)': {
        display: 'flex',
      },
      'screen and (min-width: 1024px)': {
        display: 'none',
      },
    },
  },
])

export const navItem = style([
  {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    flex: 1,
    transition: 'opacity 0.2s ease',
    color: color.text3,

    ':hover': {
      opacity: 0.8,
    },

    ':active': {
      opacity: 0.6,
    },
  },
])

export const navItemActive = style({
  color: color.accent,
})

export const navItemIcon = style({
  width: '24px',
  height: '24px',
})

export const navItemLabel = style({
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: 1,
})

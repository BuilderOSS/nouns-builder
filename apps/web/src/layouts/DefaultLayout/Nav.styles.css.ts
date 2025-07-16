import { atoms, color, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

import { NAV_BUTTON_ZINDEX } from 'src/constants/zIndex'
import * as z from 'src/utils/layers'

export const NavContainer = style([
  atoms({ m: 'auto', backgroundColor: 'background1', pos: 'fixed', w: '100vw' }),
  {
    zIndex: z.NAV_LAYER,
  },
])

export const NavWrapper = style([
  atoms({
    py: { '@initial': 'x3', '@768': 'x5' },
    px: 'x8',
    w: '100%',
  }),
  {
    maxWidth: '1440px',
    height: '80px',
    zIndex: z.NAV_LAYER,
  },
])

export const navButton = style({
  selectors: {
    '&[data-active="true"]': {
      zIndex: NAV_BUTTON_ZINDEX,
    },
  },
})

// to display over the navButton (Avatar) when that menu is open
export const activeNavAvatar = style([
  atoms({
    position: 'absolute',
    h: 'x10',
    w: 'x10',
    borderRadius: 'round',
  }),
  {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: NAV_BUTTON_ZINDEX + 1,
  },
])

export const connectButtonWrapper = style([
  {
    fontFamily: 'ptRoot, Arial, Helvetica, sans-serif !important',
    fontWeight: 400,
    zIndex: z.NAV_CONTENT_LAYER,
    width: '100%',
    selectors: {
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
])

export const navMenuItem = style({
  fontWeight: 700,
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

export const navMenuBurger = style([
  atoms({
    cursor: 'pointer',
    borderStyle: 'solid',
    borderColor: 'border',
    borderWidth: 'normal',
    borderRadius: 'round',
  }),
  {
    selectors: {
      '&:hover': {
        background: vars.color.ghostHover,
      },
    },
  },
])

export const disconnectButton = style([
  atoms({
    cursor: 'pointer',
    py: 'x2',
    fontWeight: 'label',
    fontSize: 16,
    borderRadius: 'curved',
    borderColor: 'transparent',
  }),
  {
    backgroundColor: 'rgba(240, 50, 50, 0.1)',
    lineHeight: '24px',
    color: 'red',
  },
])

export const footerLink = style([
  atoms({
    textAlign: { '@initial': 'center', '@1024': 'left' },
  }),
  {
    fontSize: 16,
  },
])

export const footerWrapper = style([
  {
    borderTop: `2px solid ${color.border}`,
  },
])

export const footerContent = style({
  maxWidth: '90rem',
})

export const myDaosWrapper = style([
  atoms({
    overflowY: 'scroll',
    maxHeight: 'x64',
  }),
])

export const footerLogo = style({
  marginLeft: -2,
})

export const footerLogoTextLeft = style({
  textAlign: 'right',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
})

export const footerLogoTextRight = style({
  textAlign: 'left',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
})

export const chainPopUpButton = style({
  backgroundColor: 'white',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.background2,
    },
  },
})

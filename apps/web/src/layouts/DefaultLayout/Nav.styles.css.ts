import * as z from '@buildeross/constants/layers'
import { atoms, color } from '@buildeross/zord'
import { keyframes, style } from '@vanilla-extract/css'

const slideIn = keyframes({
  '0%': { transform: 'translateY(-100%)' },
  '100%': { transform: 'translateY(0)' },
})

export const mobileMenuSlideIn = style([
  {
    animation: `${slideIn} 0.3s ease-out`,
  },
  atoms({
    shadow: 'medium',
  }),
])

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
      zIndex: z.NAV_BUTTON_LAYER,
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
    zIndex: z.NAV_BUTTON_LAYER + 1,
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
    zIndex: z.NAV_BUTTON_LAYER + 1,
    transition:
      'border 0.1s ease-in-out, background 0.1s ease-in-out, transform 0.1s ease-out',
    selectors: {
      '&:hover': {
        background: color.ghostHover,
      },
    },
  },
])

export const disconnectButton = style([
  atoms({
    borderColor: 'negative',
  }),
  {
    transition:
      'border 0.1s ease-in-out, background 0.1s ease-in-out, transform 0.1s ease-out',
    background: color.ghost,
    selectors: {
      '&:hover': {
        background: `rgba(240, 50, 50, 0.1) !important`,
      },
    },
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
    overflowY: 'auto',
    maxHeight: 'x64',
  }),
])

export const daoButton = style({
  background: color.ghost,
  transition:
    'border 0.1s ease-in-out, background 0.1s ease-in-out, transform 0.1s ease-out',
  selectors: {
    '&:hover': {
      background: color.background2,
    },
  },
})

export const navLogo = style({
  zIndex: z.NAV_LAYER,
  position: 'relative',
})

export const profileRow = style([
  atoms({
    cursor: 'pointer',
    p: 'x2',
    borderRadius: 'normal',
  }),
  {
    transition:
      'border 0.1s ease-in-out, background 0.1s ease-in-out, transform 0.1s ease-out',
    selectors: {
      '&:hover': {
        background: color.background2,
      },
    },
  },
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
  transition:
    'border 0.1s ease-in-out, background 0.1s ease-in-out, transform 0.1s ease-out',
  background: 'white',
  selectors: {
    '&:hover': {
      background: color.background2,
    },
  },
})

export const wrongNetworkButton = style({
  transition:
    'border 0.1s ease-in-out, background 0.1s ease-in-out, transform 0.1s ease-out',
  background: `rgba(240, 50, 50, 0.1)`,
  color: color.negative,
  selectors: {
    '&:hover': {
      background: `rgba(240, 50, 50, 0.3)`,
    },
  },
})

import { globalStyle, style } from '@vanilla-extract/css'

const darkFooterSurface = '#1f2024'
const darkFooterSurfaceHover = '#34363d'
const darkFooterBorder = '#4a4d57'

export const homeFooterWrapper = style({
  selectors: {
    'html[data-theme-mode="dark"] &': {
      background: darkFooterSurface,
      color: '#ffffff',
    },
  },
})

export const getStartedButton = style({
  fontSize: 26,
  background: 'rgba(255,255,255,.3)',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      background: darkFooterSurfaceHover,
      color: '#ffffff',
    },
    '&:hover': {
      background: 'rgba(255,255,255,.35)',
      cursor: 'pointer',
    },
    'html[data-theme-mode="dark"] &:hover': {
      background: '#3b3e47',
    },
  },
  '@media': {
    '(max-width: 768px)': {
      fontSize: 16,
      padding: '12px 24px',
    },
  },
})

export const homeFooterLinks = style({
  selectors: {
    'html[data-theme-mode="dark"] &': {
      color: '#ffffff',
    },
    '&:hover': {
      color: '#fff',
      opacity: 0.8,
      cursor: 'pointer',
    },
  },
})

export const homeFooterSocialIcon = style({
  selectors: {
    'html[data-theme-mode="dark"] &': {
      background: '#34363d',
      color: '#ffffff',
      fill: '#ffffff',
    },
  },
})

export const homeFooterGithubIcon = style({})

globalStyle(`html[data-theme-mode="dark"] ${homeFooterGithubIcon} svg`, {
  filter: 'invert(1)',
})

export const homeFooterInnerWrapper = style({
  '@media': {
    '(max-width: 768px)': {
      flexDirection: 'column',
    },
  },
})

export const footerHeading = style({
  selectors: {
    'html[data-theme-mode="dark"] &': {
      color: '#ffffff',
    },
  },
  '@media': {
    '(max-width: 768px)': {
      maxWidth: 246,
      fontSize: 28,
    },
  },
})

export const footerLeftWrapper = style({
  maxWidth: 733,
  paddingLeft: 32,
  '@media': {
    '(max-width: 768px)': {
      paddingLeft: 0,
      maxWidth: 246,
      fontSize: 28,
      marginLeft: 34,
    },
  },
})

export const footerRightWrapper = style({
  paddingRight: 32,
  '@media': {
    '(max-width: 768px)': {
      display: 'flex',
      alignItems: 'center',
      paddingTop: 32,
      marginTop: 32,
      borderTop: '2px solid #333333',
      paddingRight: 0,
    },
  },
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: darkFooterBorder,
    },
  },
})

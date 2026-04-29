import { vars } from '@buildeross/zord'
import { globalStyle, style } from '@vanilla-extract/css'

const darkFooterSurface = vars.color.background1
const darkFooterSurfaceHover = vars.color.background2
const darkFooterBorder = vars.color.border

export const homeFooterWrapper = style({
  selectors: {
    'html[data-theme-mode="dark"] &': {
      background: darkFooterSurface,
      color: vars.color.text1,
    },
  },
})

export const getStartedButton = style({
  fontSize: 26,
  background: vars.color.backdrop,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      background: darkFooterSurfaceHover,
      color: vars.color.text1,
    },
    '&:hover': {
      background: vars.color.neutralHover,
      cursor: 'pointer',
    },
    'html[data-theme-mode="dark"] &:hover': {
      background: vars.color.background2,
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
      color: vars.color.text1,
    },
    '&:hover': {
      color: vars.color.text1,
      opacity: 0.8,
      cursor: 'pointer',
    },
  },
})

export const homeFooterSocialIcon = style({
  selectors: {
    'html[data-theme-mode="dark"] &': {
      background: vars.color.background2,
      color: vars.color.text1,
      fill: vars.color.text1,
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
      color: vars.color.text1,
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
      borderTop: `2px solid ${vars.color.border}`,
      paddingRight: 0,
    },
  },
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: darkFooterBorder,
    },
  },
})

import { border, ease, radii, size, space, typography } from './tokens'
import { colorTheme } from './utils'
import {
  createTheme,
  createThemeContract,
  globalStyle,
  style,
} from '@vanilla-extract/css'
import '@vanilla-extract/private'

export const theme = createThemeContract({
  fonts: {
    heading: '',
    body: '',
    mono: '',
  },
  fontSizing: {
    fontSize: {
      0: '',
      12: '',
      14: '',
      16: '',
      18: '',
      20: '',
      28: '',
      30: '',
      35: '',
      40: '',
      48: '',
      50: '',
      65: '',
      80: '',
      unset: '',
    },
    lineHeight: {
      0: '',
      14: '',
      20: '',
      24: '',
      25: '',
      30: '',
      34: '',
      40: '',
      50: '',
      55: '',
      65: '',
      70: '',
      85: '',
      95: '',
      unset: '',
    },
    fontWeight: {
      display: '',
      heading: '',
      label: '',
      paragraph: '',
    },
  },
  radii: {
    tiny: '',
    small: '',
    normal: '',
    curved: '',
    phat: '',
    round: '',
  },
  size: {
    x0: '',
    x1: '',
    x2: '',
    x3: '',
    x4: '',
    x5: '',
    x6: '',
    x7: '',
    x8: '',
    x9: '',
    x10: '',
    x11: '',
    x12: '',
    x13: '',
    x14: '',
    x15: '',
    x16: '',
    x17: '',
    x18: '',
    x19: '',
    x20: '',
    x21: '',
    x22: '',
    x23: '',
    x24: '',
    x25: '',
    x26: '',
    x27: '',
    x28: '',
    x29: '',
    x30: '',
    x32: '',
    x64: '',
    auto: '',
    '100vw': '',
    '100vh': '',
    '100%': '',
    unset: '',
  },
  space: {
    x0: '',
    x1: '',
    x2: '',
    x3: '',
    x4: '',
    x5: '',
    x6: '',
    x7: '',
    x8: '',
    x9: '',
    x10: '',
    x11: '',
    x12: '',
    x13: '',
    x14: '',
    x15: '',
    x16: '',
    x17: '',
    x18: '',
    x19: '',
    x20: '',
    x21: '',
    x22: '',
    x23: '',
    x24: '',
    x25: '',
    x26: '',
    x27: '',
    x28: '',
    x29: '',
    x30: '',
    x32: '',
    x64: '',
    auto: '',
  },
  ease: {
    in: '',
    out: '',
    inOut: '',
  },
  border: {
    width: {
      none: '',
      thin: '',
      normal: '',
      thick: '',
    },
    style: {
      solid: '',
      dashed: '',
      dotted: '',
    },
  },
  colors: {
    backdrop: '',
    border: '',
    borderOnImage: '',
    background1: '',
    background2: '',
    text1: '',
    text2: '',
    text3: '',
    text4: '',
    icon1: '',
    icon2: '',
    primary: '',
    secondary: '',
    tertiary: '',
    quaternary: '',
    transparent: '',
    accent: '',
    accentHover: '',
    accentActive: '',
    accentDisabled: '',
    onAccent: '',
    onAccentDisabled: '',
    positive: '',
    positiveHover: '',
    positiveActive: '',
    positiveDisabled: '',
    onPositive: '',
    onPositiveDisabled: '',
    warning: '',
    warningHover: '',
    warningActive: '',
    warningDisabled: '',
    onWarning: '',
    onWarningDisabled: '',
    negative: '',
    negativeHover: '',
    negativeActive: '',
    negativeDisabled: '',
    onNegative: '',
    onNegativeDisabled: '',
    ghost: '',
    ghostHover: '',
    ghostActive: '',
    ghostDisabled: '',
    onGhost: '',
    onGhostDisabled: '',
    neutral: '',
    neutralHover: '',
    neutralActive: '',
    neutralDisabled: '',
    onNeutral: '',
    onNeutralDisabled: '',
  },
  shadows: {
    small: '',
    medium: '',
  },
})

var { colors, shadows } = colorTheme({})
export const lightTheme = createTheme(theme, {
  fonts: {
    heading: typography.fonts.body,
    body: typography.fonts.body,
    mono: typography.fonts.mono,
  },
  fontSizing: {
    fontSize: typography.fontSize,
    lineHeight: typography.lineHeight,
    fontWeight: typography.fontWeight,
  },
  colors,
  shadows,
  radii,
  size,
  space,
  ease,
  border,
})

var { colors, shadows } = colorTheme({
  // foreground: '#ffff00',
  // background: '#ff0000',
  // accent: '#00ffff',
  // positive: '#00ff00',
  // negative: '#ff00ff',
  // warning: '#9f00ff',
  foreground: '#ffffff',
  background: '#000000',
  accent: '#ffffff',
  // accent: '#00ffff',
  positive: '#1CB687',
  negative: '#F03232',
  warning: '#F5A623',
})

export const darkTheme = createTheme(theme, {
  fonts: {
    heading: typography.fonts.body,
    body: typography.fonts.body,
    mono: typography.fonts.mono,
  },
  fontSizing: {
    fontSize: typography.fontSize,
    lineHeight: typography.lineHeight,
    fontWeight: typography.fontWeight,
  },
  colors,
  shadows,
  radii,
  size,
  space,
  ease,
  border,
})

export const [baseTheme, vars] = createTheme({
  color: theme.colors,
  fonts: theme.fonts,
  fontSize: theme.fontSizing.fontSize,
  lineHeight: theme.fontSizing.lineHeight,
  fontWeight: theme.fontSizing.fontWeight,
  radii: theme.radii,
  shadows: theme.shadows,
  size: theme.size,
  space: theme.space,
  ease: theme.ease,
  border: theme.border,
})

export const root = style({
  backgroundColor: theme.colors.background1,
  color: theme.colors.text1,
})

globalStyle('html', {
  fontFamily: 'inherit',
  scrollBehavior: 'smooth',
})

globalStyle('html, body', {
  padding: 0,
  margin: 0,
  height: '100%',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
})

globalStyle('*', {
  boxSizing: 'border-box',
})

/*
     Notes:
     - This allows us to have a holy-grail `flex` layout: https: //philipwalton.github.io/solved-by-flexbox/demos/holy-grail/
     - Child pages can fill browser height with `flex: 1`, instead of `height: 100vh`
     - Fallback for Safari mobile feature `stretch`
 */

globalStyle('#__next, #__next>div[data-rk]', {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
})

globalStyle('a', {
  textDecoration: 'none',
  cursor: 'pointer',
  color: 'inherit',
})

globalStyle('.zord-text a[href]:not(:where([href^="#"],[href^="/"]:not([href^="//"])))', {
  // Selector excludes hash-only links, and excludes relative but not double-slash-only links
  position: 'relative',
  textDecoration: 'underline',
  // 'text-underline-position': 'under', // --> does not exist in type 'GlobalStyleRule', so specified in globals.css per project
  marginRight: '1em',
  whiteSpace: 'nowrap',
})

globalStyle(
  '.zord-text a[href]:not(:where([href^="#"],[href^="/"]:not([href^="//"]))):hover',
  {
    // Selector excludes hash-only links, and excludes relative but not double-slash-only links
    textDecoration: 'none',
    color: 'currentColor',
  },
)

globalStyle(
  '.zord-text a[href]:not(:where([href^="#"],[href^="/"]:not([href^="//"]))):after',
  {
    // Selector excludes hash-only links, and excludes relative but not double-slash-only links
    content: '↗',
    fontFamily: 'system-ui',
    opacity: 0.8,
    fontSize: '0.9em',
    position: 'absolute',
    right: '-0.9em',
    bottom: '-0.3em',
  },
)

globalStyle('input, textarea, select', {
  fontFamily: 'inherit',
})

globalStyle(
  'input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button',
  {
    WebkitAppearance: 'none',
    margin: 0,
  },
)

globalStyle('h1,h2,h3,h4,h5,h6,p', {
  padding: 0,
  margin: 0,
})

globalStyle('.profile-dao-links', {
  marginRight: '0 !important',
})

globalStyle('.profile-dao-links::after', {
  content: 'none !important',
})

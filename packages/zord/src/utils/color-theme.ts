import mix from './color-blend'

/*

colorThemeVars can be used to generate local css variable
overrides for use with assignInlineVars

import {
  colorThemeVars,
  vars,
} from '@buildeross/zord'
import { assignInlineVars } from '@vanilla-extract/dynamic'

const themeValues = colorThemeVars({
  foreground: '#252329',
  background: '#ffffff',
  accent: '#92ea22',
})
const colorOverrides = { border: '#ccc' }

// Convert colorThemeVars to inlineVars for use with assignInlineVars
const inlineVars = Object.entries({ ...themeValues, ...colorOverrides }).reduce(
  (obj, [k, v]) => ({ ...obj, [vars.color[k]]: v })
, {})

return (
  <Box style={assignInlineVars(inlineVars)}>
    ...
  </Box>
)

*/

export function colorThemeVars({
  foreground = '#000000',
  background = '#ffffff',
  accent = '#000000',
  positive = '#1CB687',
  negative = '#F03232',
  warning = '#F5A623',
}) {
  return {
    background1: background,
    background2: mix(0.1, background, foreground),

    text1: foreground,
    text2: mix(0.9, background, foreground),
    text3: mix(0.7, background, foreground),
    text4: mix(0.5, background, foreground),

    primary: foreground,
    secondary: mix(0.9, background, foreground),
    tertiary: mix(0.7, background, foreground),
    quaternary: mix(0.5, background, foreground),

    icon1: foreground,
    icon2: mix(0.3, background, foreground),

    border: mix(0.9, foreground, background),
    borderOnImage: foreground + '1a', // 1a = 0.1 opacity

    elevation1: `0px 4px 10px ${foreground}0f`, // 0f = 0.06 opacity
    elevation2: `0px 9px 20px ${foreground}24`, // 24 = 0.14 opacity

    backdrop: foreground + '2b', // 2b = 0.17 opacity

    accent: accent,
    accentHover: mix(0.2, accent, background),
    accentActive: mix(0.3, accent, background),
    accentDisabled: mix(0.4, accent, background),
    onAccent: background,
    onAccentDisabled: mix(0.6, accent, background),

    neutral: mix(0.9, foreground, background),
    neutralHover: mix(0.8, foreground, background),
    neutralActive: mix(0.7, foreground, background),
    neutralDisabled: mix(0.9, foreground, background),
    onNeutral: foreground,
    onNeutralDisabled: mix(0.7, foreground, background),

    ghost: background,
    ghostHover: mix(0.9, foreground, background),
    ghostActive: mix(0.8, foreground, background),
    ghostDisabled: mix(0.7, foreground, background),
    onGhost: foreground,
    onGhostDisabled: mix(0.7, foreground, background),

    positive: positive,
    positiveHover: mix(0.3, positive, background),
    positiveActive: mix(0.5, positive, background),
    positiveDisabled: mix(0.7, positive, background),
    onPositive: background,
    onPositiveDisabled: mix(0.6, positive, background),

    negative: negative,
    negativeHover: mix(0.3, negative, background),
    negativeActive: mix(0.5, negative, background),
    negativeDisabled: mix(0.7, negative, background),
    onNegative: background,
    onNegativeDisabled: mix(0.6, negative, background),

    warning: warning,
    warningHover: mix(0.3, warning, background),
    warningActive: mix(0.5, warning, background),
    warningDisabled: mix(0.7, warning, background),
    onWarning: background,
    onWarningDisabled: mix(0.6, warning, background),
  }
}

export function colorTheme(colorProps: { [x: string]: string }) {
  const tokens = colorThemeVars(colorProps)

  return {
    colors: {
      backdrop: tokens.backdrop,
      border: tokens.border,
      borderOnImage: tokens.borderOnImage,
      background1: tokens.background1,
      background2: tokens.background2,

      text1: tokens.text1,
      text2: tokens.text2,
      text3: tokens.text3,
      text4: tokens.text4,
      transparent: 'transparent',

      icon1: tokens.icon1,
      icon2: tokens.icon2,

      primary: tokens.text1,
      secondary: tokens.text2,
      tertiary: tokens.text3,
      quaternary: tokens.text4,

      accent: tokens.accent,
      accentHover: tokens.accentHover,
      accentActive: tokens.accentActive,
      accentDisabled: tokens.accentDisabled,
      onAccent: tokens.onAccent,
      onAccentDisabled: tokens.onAccentDisabled,

      positive: tokens.positive,
      positiveHover: tokens.positiveHover,
      positiveActive: tokens.positiveActive,
      positiveDisabled: tokens.positiveDisabled,
      onPositive: tokens.onPositive,
      onPositiveDisabled: tokens.onPositiveDisabled,

      warning: tokens.warning,
      warningHover: tokens.warningHover,
      warningActive: tokens.warningActive,
      warningDisabled: tokens.warningDisabled,
      onWarning: tokens.onWarning,
      onWarningDisabled: tokens.onWarningDisabled,

      negative: tokens.negative,
      negativeHover: tokens.negativeHover,
      negativeActive: tokens.negativeActive,
      negativeDisabled: tokens.negativeDisabled,
      onNegative: tokens.onNegative,
      onNegativeDisabled: tokens.onNegativeDisabled,

      ghost: tokens.ghost,
      ghostHover: tokens.ghostHover,
      ghostActive: tokens.ghostActive,
      ghostDisabled: tokens.ghostDisabled,
      onGhost: tokens.onGhost,
      onGhostDisabled: tokens.onGhostDisabled,

      neutral: tokens.neutral,
      neutralHover: tokens.neutralHover,
      neutralActive: tokens.neutralActive,
      neutralDisabled: tokens.neutralDisabled,
      onNeutral: tokens.onNeutral,
      onNeutralDisabled: tokens.onNeutralDisabled,
    },

    shadows: {
      small: tokens.elevation1,
      medium: tokens.elevation2,
    },
  }
}

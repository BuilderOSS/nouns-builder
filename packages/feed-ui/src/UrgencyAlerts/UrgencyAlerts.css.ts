import { atoms, theme, vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const urgencyAlertCard = style([
  atoms({
    p: 'x4',
    borderRadius: 'curved',
    borderWidth: 'normal',
    borderStyle: 'solid',
    backgroundColor: 'background1',
    w: '100%',
  }),
  {
    transition: 'all 0.15s ease-in-out',
    ':hover': {
      boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
    },
  },
])

export const urgencyAlertLevelVariants = styleVariants({
  warning: {
    borderColor: theme.colors.warning,
  },
  critical: {
    borderColor: theme.colors.negative,
    boxShadow: `0 2px 8px ${theme.colors.negativeDisabled}`,
  },
})

export const urgencyAlertTitle = atoms({
  fontWeight: 'display',
  fontSize: 18,
  color: 'text1',
})

export const urgencyAlertSubtitle = style([
  atoms({
    fontSize: 14,
    color: 'text2',
  }),
  {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
])

export const urgencyAlertBadge = style([
  atoms({
    px: 'x3',
    py: 'x1',
    borderRadius: 'round',
    borderWidth: 'normal',
    borderStyle: 'solid',
    fontSize: 14,
    fontWeight: 'label',
  }),
  {
    borderColor: theme.colors.warningDisabled,
    color: theme.colors.text1,
    whiteSpace: 'nowrap',
  },
])

const urgencyAlertCountdownBase = style({
  color: vars.color.text1,
  fontWeight: vars.fontWeight.display,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
})

export const urgencyAlertCountdown = styleVariants({
  warning: [urgencyAlertCountdownBase],
  critical: [urgencyAlertCountdownBase],
})

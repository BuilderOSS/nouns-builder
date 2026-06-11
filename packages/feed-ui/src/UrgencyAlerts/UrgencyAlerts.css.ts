import { atoms, theme } from '@buildeross/zord'
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
  fontSize: 16,
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
    px: 'x2',
    borderRadius: 'round',
    borderWidth: 'normal',
    borderStyle: 'solid',
    fontSize: 12,
  }),
  {
    borderColor: theme.colors.warningDisabled,
    color: theme.colors.warning,
    whiteSpace: 'nowrap',
  },
])

export const urgencyAlertCountdown = styleVariants({
  warning: {
    color: theme.colors.warning,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  critical: {
    color: theme.colors.negative,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
})

import { media, theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const cardVariants = {
  default: style({
    transition: 'border-color 0.15s ease-in-out',
    borderColor: theme.colors.border,
    ':hover': {
      borderColor: theme.colors.neutralHover,
      boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
    },
  }),
  warning: style({
    transition: 'border-color 0.15s ease-in-out',
    borderColor: theme.colors.warning,
    ':hover': {
      borderColor: theme.colors.warningHover,
      boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
    },
  }),
}

export const titleStyle = style([
  {
    order: 2,
    minWidth: 0,
    '@media': {
      [media.min768]: { order: 1, flexGrow: 1 },
    },
  },
])

export const statusStyle = style([
  {
    order: 1,
    '@media': {
      [media.min768]: { order: 2 },
    },
  },
])

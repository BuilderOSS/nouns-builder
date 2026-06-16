import { theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const candidateCard = style({
  width: '100%',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease-in-out',
  borderColor: theme.colors.border,
  ':hover': {
    borderColor: theme.colors.neutralHover,
    boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
  },
})

export const title = style({
  minWidth: 0,
  flexGrow: 1,
})

export const stats = style({
  flexShrink: 0,
  width: '100%',
})

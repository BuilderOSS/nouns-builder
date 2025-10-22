import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const hoverButton = style({
  selectors: {
    '&:hover': {
      background: vars.color.border,
    },
  },
})

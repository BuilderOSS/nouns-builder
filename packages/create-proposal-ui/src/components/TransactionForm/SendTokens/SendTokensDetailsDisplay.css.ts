import { color } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const link = style({
  color: color.text1,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      color: color.text3,
    },
  },
})

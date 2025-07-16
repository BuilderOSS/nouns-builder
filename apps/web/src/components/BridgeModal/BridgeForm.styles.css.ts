import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const chainPopUpButton = style({
  backgroundColor: 'white',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.background2,
    },
  },
})

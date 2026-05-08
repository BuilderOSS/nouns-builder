import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'
export const holderLink = style({
  transition: 'background-color 0.2s ease-in-out',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.background2,
    },
    '&:focus-visible': {
      backgroundColor: vars.color.background2,
    },
  },
})

import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const actionButtons = style({
  width: '100%',
  '@media': {
    '(max-width: 1023px)': {
      display: 'none',
    },
  },
})

export const daoButton = style({
  borderColor: `${vars.color.border} !important`,
})

import { style } from '@vanilla-extract/css'

export const actionButtons = style({
  width: '100%',
  '@media': {
    '(max-width: 1023px)': {
      display: 'none',
    },
  },
})

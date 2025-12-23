import { style } from '@vanilla-extract/css'

export const container = style({
  '@media': {
    'screen and (min-width: 1024px)': {
      minHeight: 'calc(100vh - 90px)',
    },
  },
})

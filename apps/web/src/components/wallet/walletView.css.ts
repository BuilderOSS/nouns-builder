import { style } from '@vanilla-extract/css'

export const actionRow = style({
  '@media': {
    'screen and (max-width: 768px)': {
      flexDirection: 'column',
      width: '100%',
    },
  },
})

export const actionButton = style({
  flex: 1,
  '@media': {
    'screen and (max-width: 768px)': {
      flex: '0 0 auto',
      width: '100%',
    },
  },
})

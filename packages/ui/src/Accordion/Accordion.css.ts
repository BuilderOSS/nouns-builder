import { style } from '@vanilla-extract/css'

export const accordionName = style({
  '@media': {
    '(max-width: 768px)': {
      paddingTop: 16,
      paddingBottom: 16,
      fontSize: 16,
      height: 'auto',
    },
  },
})

export const accordionItem = style({
  '@media': {
    '(max-width: 768px)': {
      paddingLeft: 16,
      paddingRight: 16,
    },
  },
})

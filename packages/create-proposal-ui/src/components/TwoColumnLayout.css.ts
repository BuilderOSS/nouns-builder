import { style } from '@vanilla-extract/css'

export const twoColumnLayout = style({
  gridTemplateColumns: `repeat(2, minmax(0, 1fr))`,
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: `repeat(1, minmax(0, 1fr))`,
    },
  },
})

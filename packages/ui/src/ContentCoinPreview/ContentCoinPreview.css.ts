import { style } from '@vanilla-extract/css'

export const previewContainer = style({
  position: 'relative',
  width: '100%',
  '@media': {
    '(min-width: 1024px)': {
      position: 'sticky',
      top: '24px',
    },
  },
})

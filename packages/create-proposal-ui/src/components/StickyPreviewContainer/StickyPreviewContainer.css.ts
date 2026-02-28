import { style } from '@vanilla-extract/css'

export const previewContainer = style({
  position: 'absolute',
  right: 0,
  top: 0,
  height: '100%',
  width: '100%',
  '@media': {
    'screen and (max-width: 768px)': {
      width: '100%',
      position: 'relative',
    },
    'screen and (min-width: 768px)': {
      width: '50%',
    },
  },
})

export const stickyWrapper = style({
  position: 'sticky',
  right: 0,
})

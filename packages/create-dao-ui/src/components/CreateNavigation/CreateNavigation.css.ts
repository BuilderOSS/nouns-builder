import { style } from '@vanilla-extract/css'

export const flowWrapper = style({
  display: 'flex',
  position: 'absolute',
  bottom: 84,
  left: '50%',
  margin: '0 auto',
  transform: 'translateX(-50%)',
  zIndex: 1,
  justifyContent: 'space-around',
  '@media': {
    '(max-width: 768px)': {
      display: 'none',
    },
  },
})

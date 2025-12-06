import { atoms, color, space } from '@buildeross/zord'
import { keyframes, style } from '@vanilla-extract/css'

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
})

export const skeletonPulse = style({
  animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
})

export const skeletonBox = style({
  backgroundColor: color.background2,
  borderRadius: 4,
})

export const skeletonCircle = style([
  atoms({
    backgroundColor: 'background2',
  }),
  {
    width: space.x10,
    height: space.x10,
    borderRadius: '50%',
    flexShrink: 0,
  },
])

export const skeletonContentHorizontal = style({
  '@media': {
    '(min-width: 480px)': {
      display: 'flex',
      flexDirection: 'row',
      gap: space.x4,
      alignItems: 'flex-start',
    },
  },
})

export const skeletonImage = style({
  width: '100%',
  aspectRatio: '1 / 1',
  borderRadius: '12px',
  '@media': {
    '(min-width: 480px)': {
      width: '240px',
      flexShrink: 0,
    },
  },
})

export const skeletonMetaRow = style({
  display: 'flex',
  flexDirection: 'column',
  gap: space.x3,
  width: '100%',
  '@media': {
    '(min-width: 768px)': {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: space.x4,
    },
  },
})

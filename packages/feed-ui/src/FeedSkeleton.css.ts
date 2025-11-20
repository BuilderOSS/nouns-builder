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

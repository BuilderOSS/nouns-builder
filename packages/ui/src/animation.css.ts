import { keyframes } from '@vanilla-extract/css'

export const pulse = keyframes({
  '0%': { opacity: '1' },
  '100%': { opacity: '1' },
  '50%': { opacity: '.5' },
})

export const skeletonAnimation = `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`

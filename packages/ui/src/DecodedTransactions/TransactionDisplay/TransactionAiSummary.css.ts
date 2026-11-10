import { vars } from '@buildeross/zord'
import { keyframes, style } from '@vanilla-extract/css'

import { skeletonAnimation } from '../../animation.css'

const easeOut = 'cubic-bezier(0.23, 1, 0.32, 1)'

const reveal = keyframes({
  from: { opacity: 0, filter: 'blur(4px)', transform: 'translateY(2px)' },
  to: { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
})

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

export const sparkle = style({
  flexShrink: 0,
  color: vars.color.accent,
})

/** The summary arrives once per call, so it gets a short, one-off reveal. */
export const summaryText = style({
  fontVariantNumeric: 'tabular-nums',
  textWrap: 'pretty',
  animation: `${reveal} 200ms ${easeOut}`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: `${fadeIn} 150ms ease-out`,
    },
  },
})

export const skeletonLine = style({
  height: 10,
  borderRadius: 4,
  backgroundColor: vars.color.background1,
  animation: skeletonAnimation,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
})

export const visuallyHidden = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
})

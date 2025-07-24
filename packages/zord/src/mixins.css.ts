import { keyframes, style } from '@vanilla-extract/css'

import { atoms } from './atoms'

/**
 *  Position & transforms
 */

export const left = {
  '50%': style({ left: '50%' }),
}

export const top = {
  '50%': style({ top: '50%' }),
}

export const translateX = {
  '-50%': style({ transform: 'translateX(-50%)' }),
}

export const translateY = {
  '-50%': style({ transform: 'translateY(-50%)' }),
}

export const translate = {
  '-50%': style({ transform: 'translate(-50%, -50%)' }),
}

export const center = {
  x: style([atoms({ position: 'absolute' }), left['50%'], translateX['-50%']]),
  y: style([atoms({ position: 'absolute' }), top['50%'], translateY['-50%']]),
  xy: style([
    atoms({ position: 'absolute' }),
    left['50%'],
    top['50%'],
    translate['-50%'],
  ]),
}

/**
 *  Display
 */

export const display = {
  none: atoms({
    display: 'none',
  }),
  block: atoms({
    display: 'block',
  }),
  inline: atoms({
    display: 'inline',
  }),
  flex: atoms({
    display: 'flex',
  }),
  grid: atoms({
    display: 'grid',
  }),
  ['inline-block']: atoms({
    display: 'inline-block',
  }),
  ['inline-flex']: atoms({
    display: 'inline-flex',
  }),
}

/**
 *  Dimensions and positioning
 */

export const objectFit = {
  contain: atoms({
    objectFit: 'contain',
  }),
  cover: atoms({
    objectFit: 'cover',
  }),
  fill: atoms({
    objectFit: 'fill',
  }),
  scaleDown: atoms({
    objectFit: 'scale-down',
  }),
}

/**
 *  Pointer events
 */

export const pointerEvents = {
  none: atoms({
    pointerEvents: 'none',
  }),
  auto: atoms({
    pointerEvents: 'auto',
  }),
}

/**
 *  Overflow
 */

export const overflow = {
  auto: atoms({
    overflow: 'auto',
  }),
  hidden: atoms({
    overflow: 'hidden',
  }),
  scroll: atoms({
    overflow: 'scroll',
  }),
}

/**
 *  Text
 */

export const textTransform = {
  uppercase: atoms({
    textTransform: 'uppercase',
  }),
  capitalize: atoms({
    textTransform: 'capitalize',
  }),
  none: atoms({
    textTransform: 'none',
  }),
}

export const whiteSpace = {
  nowrap: style({ whiteSpace: 'nowrap' }),
}

export const ellipsis = style({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
})

/**
 *  Cursor
 */

export const cursor = {
  pointer: atoms({
    cursor: 'pointer',
  }),
}

/**
 * Animation & transitions
 */

const fadeInKeyframes = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
})

export const fadeIn = {
  '0.2': style({
    animation: `${fadeInKeyframes} 0.2s ease-out`,
  }),
  '0.3': style({
    animation: `${fadeInKeyframes} 0.3s ease-out`,
  }),
  '0.4': style({
    animation: `${fadeInKeyframes} 0.4s ease-out`,
  }),
}

export const transitionOpacity = {
  '0.2': style({
    transition: 'opacity 0.2s ease-out',
  }),
}

export const hoverFadeOut = style([
  {
    selectors: {
      '&:hover': {
        opacity: 0.6,
      },
    },
  },
  transitionOpacity[0.2],
])

export const hoverFadeIn = style([
  {
    opacity: 0.6,
    selectors: {
      '&:hover': {
        opacity: 1,
      },
    },
  },
  transitionOpacity[0.2],
])

/**
 *  Debug
 */

export const test = {
  red: style({
    border: '1px solid red',
  }),
  blue: style({
    border: '1px solid blue',
  }),
}

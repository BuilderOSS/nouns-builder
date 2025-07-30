import { keyframes, style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

import { atoms } from '../atoms'
import { vars } from '../theme'

export const rotateKeyframes = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
})

export const iconVariants = {
  color: {
    primary: [
      style({
        color: 'inherit',
        selectors: {
          '&:not([disabled]):hover': {
            color: vars.color.accentHover,
          },
        },
      }),
    ],
  },
  size: {
    sm: {
      width: vars.space.x3,
      height: vars.space.x3,
    },
    md: {
      width: vars.space.x4,
      height: vars.space.x4,
    },
    lg: {
      width: vars.space.x5,
      height: vars.space.x5,
    },
    xl: {
      width: vars.space.x8,
      height: vars.space.x8,
    },
  },
  flip: {
    true: [
      style({
        transformOrigin: '50%',
        transform: `rotate(180deg)`,
      }),
    ],
  },
  rotate: {
    true: [
      style({
        transformOrigin: '50%',
        animation: `${rotateKeyframes} 0.5s infinite linear`,
      }),
    ],
  },
}

export const icon = recipe({
  base: style([
    {
      position: 'relative',
      selectors: {
        '&:svg': {
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transition: 'fill 0.3s ease-out',
          fill: 'none',
        },
      },
    },
    atoms({
      display: 'block',
    }),
  ]),

  variants: iconVariants,

  defaultVariants: {
    size: 'sm',
  },
})

import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

import { atoms } from '../atoms'
import { vars } from '../theme'

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
      width: vars.space.x4,
      height: vars.space.x4,
    },
    md: {
      width: vars.space.x6,
      height: vars.space.x6,
    },
    lg: {
      width: vars.space.x8,
      height: vars.space.x8,
    },
    xl: {
      width: vars.space.x12,
      height: vars.space.x12,
    },
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
    size: 'md',
  },
})

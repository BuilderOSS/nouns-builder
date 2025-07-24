import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

import { atoms } from '../atoms'
import { vars } from '../theme'

export const inputVariants = {
  sizeVariant: {
    lg: [
      {},
      atoms({
        fontSize: 35,
        fontWeight: 'heading',
      }),
    ],
    sm: [
      {
        paddingTop: 0,
        paddingBottom: 0,
      },
      atoms({
        height: 'x6',
      }),
    ],
  },
}

export const input = recipe({
  base: style([
    {
      width: '100%',
      lineHeight: 1.3,
      backgroundColor: vars.color.background2,
      border: '2px solid transparent',
      outline: 'none',
      transition: `background-color 0.1s ease-out`,
      selectors: {
        '&::placeholder': {
          color: vars.color.tertiary,
        },
        '&:focus': {
          borderColor: vars.color.accent,
          backgroundColor: vars.color.background1,
          outline: 'none',
        },
      },
    },
    atoms({ padding: 'x3', borderRadius: 'small' }),
  ]),
  variants: inputVariants,
})

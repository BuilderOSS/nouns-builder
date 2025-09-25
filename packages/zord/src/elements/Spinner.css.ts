import { keyframes, style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

const spinAnimation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
})

export const loadingSpinner = recipe({
  base: style({
    display: 'inline-block',
    selectors: {
      '&::after': {
        display: 'block',
        content: "' '",
        borderRadius: '50%',
        border: '3px solid #000',
        borderColor: '#000 #000 #000 transparent',
        animation: `${spinAnimation} 1.5s linear infinite`,
      },
    },
  }),

  variants: {
    size: {
      sm: style({
        selectors: {
          '&::after': {
            width: 16,
            height: 16,
            margin: 2,
            borderWidth: 2,
          },
        },
      }),
      md: style({
        selectors: {
          '&::after': {
            width: 20,
            height: 20,
            margin: 4,
            borderWidth: 3,
          },
        },
      }),
      lg: style({
        selectors: {
          '&::after': {
            width: 32,
            height: 32,
            margin: 4,
            borderWidth: 4,
          },
        },
      }),
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

import { atoms } from '../atoms'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const textVariants = {
  italic: {
    true: {
      fontStyle: 'italic',
    },
  },
  variant: {
    code: atoms({
      fontSize: 14,
      lineHeight: 20,
    }),
    eyebrow: style([
      atoms({
        color: 'tertiary',
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: 'heading',
        lineHeight: 20,
      }),
      style({
        letterSpacing: '0.05em',
      }),
    ]),
    'heading-xs': atoms({
      fontSize: 20,
      fontWeight: 'heading',
      lineHeight: 24,
    }),
    'heading-sm': atoms({
      fontSize: 30,
      fontWeight: 'heading',
      lineHeight: 40,
    }),
    'heading-md': atoms({
      fontSize: 35,
      fontWeight: 'heading',
      lineHeight: 50,
    }),
    'heading-lg': atoms({
      fontSize: 40,
      fontWeight: 'heading',
      lineHeight: 55,
    }),
    'heading-xl': atoms({
      fontSize: 50,
      fontWeight: 'heading',
      lineHeight: 70,
    }),
    'label-xs': atoms({
      fontSize: 12,
      fontWeight: 'label',
      lineHeight: 20,
    }),
    'label-sm': atoms({
      fontSize: 14,
      fontWeight: 'label',
      lineHeight: 24,
    }),
    'label-md': atoms({
      fontSize: 16,
      fontWeight: 'label',
      lineHeight: 24,
    }),
    'label-lg': atoms({
      fontSize: 18,
      fontWeight: 'label',
      lineHeight: 24,
    }),
    'menu-lg': atoms({
      fontSize: 28,
      fontWeight: 'label',
      lineHeight: 34,
    }),
    'paragraph-xs': atoms({
      fontSize: 12,
      fontWeight: 'paragraph',
      lineHeight: 20,
    }),
    'paragraph-sm': atoms({
      fontSize: 14,
      fontWeight: 'paragraph',
      lineHeight: 24,
    }),
    'paragraph-md': atoms({
      fontSize: 16,
      fontWeight: 'paragraph',
      lineHeight: 24,
    }),
    'paragraph-lg': atoms({
      fontSize: 18,
      fontWeight: 'paragraph',
      lineHeight: 30,
    }),
    'display-xs': atoms({
      fontSize: 40,
      fontWeight: 'display',
      lineHeight: 50,
    }),
    'display-sm': atoms({
      fontSize: 50,
      fontWeight: 'display',
      lineHeight: 65,
    }),
    'display-md': atoms({
      fontSize: 65,
      fontWeight: 'display',
      lineHeight: 85,
    }),
    'display-lg': atoms({
      fontSize: 80,
      fontWeight: 'display',
      lineHeight: 95,
    }),
    link: style([
      atoms({
        textDecoration: 'underline',
        fontSize: 14,
        fontWeight: 'paragraph',
        lineHeight: 20,
      }),
      style({
        textUnderlineOffset: '0.15em',
      }),
    ]),
  },
} as const

export const text = recipe({
  variants: textVariants,
})

// export type TextVariants = RecipeVariants<typeof text>

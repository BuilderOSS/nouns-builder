import { style } from '@vanilla-extract/css'

import { atoms } from '../atoms'
import { vars } from '../theme'

export const inputField = style([{ gap: vars.space.x1 }])

export const inputFieldBaseInput = style([
  {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    outline: 'none',
    transition: `background-color 0.1s ${vars.ease.out}`,
    selectors: {
      '&::placeholder': {
        color: vars.color.tertiary,
      },
      '&:focus': {
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        outline: 'none',
      },
      '&[disabled]': {
        cursor: 'not-allowed',
      },
    },
  },
  atoms({
    h: '100%',
    w: '100%',
    py: 'x3',
    color: 'primary',
    fontWeight: 'paragraph',
    fontSize: 14,
    lineHeight: 24,
  }),
])

export const inputLarge = atoms({
  fontSize: 30,
})

export const inputContainer = style([
  {
    backgroundColor: vars.color.background2,
    borderColor: vars.color.background2,
    transition: `background-color 0.1s ${vars.ease.out}`,
  },
  atoms({
    p: 'x3',
    borderWidth: 'normal',
    borderStyle: 'solid',
    borderRadius: 'small',
  }),
])

export const verticalCenter = style([
  atoms({
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    top: 'x0',
    bottom: 'x0',
  }),
])

export const inputFieldAffix = style([
  {
    right: vars.space.x3,
    color: vars.color.secondary,
  },
])

export const inputFieldIcon = style([
  {
    left: vars.space.x3,
  },
])

export const focused = style([
  {
    borderColor: vars.color.accent,
    backgroundColor: vars.color.background1,
  },
])

export const focusedLowProfile = style([
  {
    backgroundColor: vars.color.background1,
    borderColor: vars.color.accent,
  },
])

export const error = style([
  {
    borderColor: vars.color.negative,
  },
])

export const canError = atoms({ minW: 'x5' })

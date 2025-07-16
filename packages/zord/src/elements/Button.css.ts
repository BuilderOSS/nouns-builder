import { atoms } from '../atoms'
import { vars } from '../theme'
import { style } from '@vanilla-extract/css'

export const baseButton = style([
  atoms({
    borderRadius: 'curved',
    borderStyle: 'solid',
    borderWidth: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    cursor: 'pointer',
  }),
  {
    transition:
      'border 0.1s ease-in-out, background 0.1s ease-in-out, transform 0.1s ease-out',
    userSelect: 'none',
    selectors: {
      '&:focus-visible': {
        outline: '2px solid rgb(32, 103, 243)',
        outlineStyle: 'auto',
      },
      '&:active': {
        transform: 'scale(0.95)',
      },
      '&[disabled]': {
        cursor: 'not-allowed',
        pointerEvents: 'none',
        opacity: 0.6,
      },
      '&[disabled]:active': {
        transform: 'unset',
      },
    },
  },
])

export const buttonSize = {
  xs: style([
    {
      width: 'auto',
    },
    atoms({
      display: 'inline-flex',
      px: 'x2',
      height: 'x7',
      minWidth: 'x10',
      fontSize: 14,
      fontWeight: 'label',
    }),
  ]),
  sm: style([
    {
      width: 'auto',
    },
    atoms({
      display: 'inline-flex',
      px: 'x3',
      height: 'x10',
      minWidth: 'x19',
      fontSize: 14,
      fontWeight: 'label',
    }),
  ]),
  md: style([
    atoms({
      h: 'x12',
      fontWeight: 'label',
      fontSize: 16,
    }),
  ]),
  lg: style([
    atoms({
      px: 'x4',
      height: 'x15',
      minWidth: 'x23',
      fontSize: 18,
      fontWeight: 'label',
    }),
  ]),
}

export const buttonVariants = {
  primary: style([
    {
      selectors: {
        '&:not([disabled]):hover': {
          cursor: 'pointer',
          backgroundColor: vars.color.accentHover,
        },
      },
    },
    atoms({
      color: 'onAccent',
      backgroundColor: 'accent',
    }),
  ]),
  secondary: style([
    {
      selectors: {
        '&:not([disabled]):hover': {
          cursor: 'pointer',
          backgroundColor: vars.color.neutralHover,
        },
      },
    },
    atoms({
      color: 'primary',
      backgroundColor: 'background2',
    }),
  ]),
  positive: style([
    {
      selectors: {
        '&:not([disabled]):hover': {
          cursor: 'pointer',
          backgroundColor: vars.color.positiveHover,
        },
      },
    },
    atoms({
      color: 'onPositive',
      backgroundColor: 'positive',
    }),
  ]),
  destructive: style([
    {
      selectors: {
        '&:not([disabled]):hover': {
          cursor: 'pointer',
          backgroundColor: vars.color.negativeHover,
        },
      },
    },
    atoms({
      color: 'onNegative',
      backgroundColor: 'negative',
    }),
  ]),
  outline: style([
    {
      selectors: {
        '&:not([disabled]):hover': {
          cursor: 'pointer',
          backgroundColor: vars.color.background2,
        },
      },
    },
    atoms({
      color: 'primary',
      borderColor: 'primary',
      borderWidth: 'normal',
      backgroundColor: 'transparent',
    }),
  ]),
  circle: style([
    {
      aspectRatio: '1 / 1',
      minWidth: 0,
      selectors: {
        '&[disabled]': {
          color: vars.color.secondary,
          backgroundColor: 'transparent',
        },
        '&:not([disabled]):hover': {
          cursor: 'pointer',
          borderColor: vars.color.accent,
        },
      },
    },
    atoms({
      p: 'x0',
      color: 'primary',
      display: 'flex',
      alignItems: 'center',
      height: 'auto',
      justifyContent: 'center',
      borderColor: 'borderOnImage',
      borderWidth: 'thin',
      borderRadius: 'round',
      backgroundColor: 'transparent',
    }),
  ]),
  circleSolid: style([
    {
      aspectRatio: '1 / 1',
      minWidth: 0,
      selectors: {
        '&[disabled]': {
          color: vars.color.secondary,
          backgroundColor: 'ghostHoverDisabled',
        },
        '&:not([disabled]):hover': {
          cursor: 'pointer',
          backgroundColor: 'ghostHover',
        },
      },
    },
    atoms({
      p: 'x0',
      color: 'primary',
      display: 'flex',
      alignItems: 'center',
      height: 'auto',
      justifyContent: 'center',
      borderColor: 'transparent',
      borderRadius: 'round',
      backgroundColor: 'background1',
    }),
  ]),
  ghost: style([
    {
      selectors: {
        '&:hover, &:not([disabled]):hover': {
          cursor: 'pointer',
          backgroundColor: vars.color.ghostHover,
        },
      },
    },
    atoms({
      color: 'onGhost',
      borderColor: 'ghost',
      backgroundColor: 'transparent',
    }),
  ]),
  // @TODO: We don't need this. It should be the default.
  unset: style({
    backgroundColor: 'unset',
    gap: 'unset',
    borderColor: 'unset',
    borderWidth: 'unset',
    borderStyle: 'unset',
    minWidth: 'unset',
    padding: 'unset',
    height: 'unset',
    fontSize: 'unset',
    fontWeight: 'unset',
  }),
}

export const buttonLoading = atoms({ pointerEvents: 'none' })

export const buttonPill = atoms({ borderRadius: 'round' })

export const buttonPillSm = atoms({
  px: 'x4',
  py: 'x1',
})

export const buttonPillMd = atoms({
  px: 'x5',
})

export const buttonPillLg = atoms({
  px: 'x6',
})

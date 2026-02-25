import { style, styleVariants } from '@vanilla-extract/css'

import { atoms } from '../atoms'
import { vars } from '../theme'

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

// Button size styles
const buttonSizeStyles = {
  xs: {
    width: 'auto',
    display: 'inline-flex' as const,
    paddingLeft: vars.space.x2,
    paddingRight: vars.space.x2,
    height: vars.size.x7,
    minWidth: vars.size.x10,
    fontSize: vars.fontSize[14],
    fontWeight: vars.fontWeight.label,
  },
  sm: {
    width: 'auto',
    display: 'inline-flex' as const,
    paddingLeft: vars.space.x3,
    paddingRight: vars.space.x3,
    height: vars.size.x10,
    minWidth: vars.size.x19,
    fontSize: vars.fontSize[14],
    fontWeight: vars.fontWeight.label,
  },
  md: {
    height: vars.size.x12,
    fontWeight: vars.fontWeight.label,
    fontSize: vars.fontSize[16],
  },
  lg: {
    paddingLeft: vars.space.x4,
    paddingRight: vars.space.x4,
    height: vars.size.x15,
    minWidth: vars.size.x23,
    fontSize: vars.fontSize[18],
    fontWeight: vars.fontWeight.label,
  },
} as const

export const buttonSize = styleVariants(buttonSizeStyles, (sizeStyle) => sizeStyle)

// Responsive button size styles - pre-generated common combinations
export const responsiveButtonSize = {
  'xs-sm': style({
    ...buttonSizeStyles.xs,
    '@media': {
      '(min-width: 768px)': buttonSizeStyles.sm,
    },
  }),
  'xs-md': style({
    ...buttonSizeStyles.xs,
    '@media': {
      '(min-width: 768px)': buttonSizeStyles.md,
    },
  }),
  'sm-md': style({
    ...buttonSizeStyles.sm,
    '@media': {
      '(min-width: 768px)': buttonSizeStyles.md,
    },
  }),
  'sm-lg': style({
    ...buttonSizeStyles.sm,
    '@media': {
      '(min-width: 768px)': buttonSizeStyles.lg,
    },
  }),
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
  secondaryAccent: style([
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
      backgroundColor: 'onAccent',
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

// Button pill size styles
const buttonPillSizeStyles = {
  xs: {},
  sm: {
    paddingLeft: vars.space.x4,
    paddingRight: vars.space.x4,
    paddingTop: vars.space.x1,
    paddingBottom: vars.space.x1,
  },
  md: {
    paddingLeft: vars.space.x5,
    paddingRight: vars.space.x5,
  },
  lg: {
    paddingLeft: vars.space.x6,
    paddingRight: vars.space.x6,
  },
} as const

export const buttonPillSize = styleVariants(
  buttonPillSizeStyles,
  (sizeStyle) => sizeStyle
)

// Responsive pill size styles
export const responsiveButtonPillSize = {
  'xs-sm': style({}),
  'xs-md': style({
    '@media': {
      '(min-width: 768px)': buttonPillSizeStyles.md,
    },
  }),
  'sm-md': style({
    ...buttonPillSizeStyles.sm,
    '@media': {
      '(min-width: 768px)': buttonPillSizeStyles.md,
    },
  }),
  'sm-lg': style({
    ...buttonPillSizeStyles.sm,
    '@media': {
      '(min-width: 768px)': buttonPillSizeStyles.lg,
    },
  }),
}

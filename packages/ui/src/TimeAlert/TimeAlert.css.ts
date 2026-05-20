import { atoms, vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

const base = style([
  atoms({
    display: 'flex',
    alignItems: 'center',
    borderRadius: 'curved',
    borderStyle: 'solid',
    borderWidth: 'thin',
    gap: 'x2',
  }),
  {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
  },
])

export const toneVariants = styleVariants({
  accent: [base, {
    borderColor: `color-mix(in srgb, ${vars.colors.accent} 25%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${vars.colors.accent} 10%, transparent)`,
    color: vars.colors.accent,
  }],
  warning: [base, {
    borderColor: `color-mix(in srgb, ${vars.colors.warning} 25%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${vars.colors.warning} 10%, transparent)`,
    color: vars.colors.warning,
  }],
  negative: [base, {
    borderColor: `color-mix(in srgb, ${vars.colors.negative} 25%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${vars.colors.negative} 10%, transparent)`,
    color: vars.colors.negative,
  }],
})

export const iconSlot = style({
  display: 'flex',
  width: 16,
  height: 16,
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
})

export const content = style({ flex: 1 })

export const dismissButton = style([
  atoms({ cursor: 'pointer', borderColor: 'transparent', borderWidth: 'none', borderStyle: 'solid' }),
  {
    marginLeft: 'auto',
    padding: 2,
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: 'currentColor',
    opacity: 0.7,
    selectors: {
      '&:hover': { opacity: 1 },
    },
  },
])

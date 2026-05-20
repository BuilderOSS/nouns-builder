import { atoms, vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

const base = style([
  atoms({
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 'round',
    borderStyle: 'solid',
    borderWidth: 'thin',
    borderColor: 'border',
    gap: 'x1',
    fontWeight: 'label',
  }),
  {
    fontSize: '11px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '2px 8px',
    lineHeight: '18px',
  },
])

export const activeBadgeVariants = styleVariants({
  active: [base, { color: vars.colors.positive, backgroundColor: `color-mix(in srgb, ${vars.colors.positive} 12%, transparent)` }],
  dormant: [base, { color: vars.colors.text3, backgroundColor: vars.colors.neutral }],
})

export const dot = styleVariants({
  active: [{ width: 6, height: 6, borderRadius: '50%', backgroundColor: vars.colors.positive, flexShrink: 0 }],
  dormant: [{ width: 6, height: 6, borderRadius: '50%', backgroundColor: vars.colors.text3, flexShrink: 0 }],
})

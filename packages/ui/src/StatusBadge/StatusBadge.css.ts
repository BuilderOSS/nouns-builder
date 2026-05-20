import { atoms, vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const baseBadge = style([
  atoms({
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 'round',
    borderStyle: 'solid',
    borderWidth: 'thin',
    borderColor: 'border',
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

export const statusBadgeVariants = styleVariants({
  Pending: [baseBadge, { color: vars.colors.warning, backgroundColor: `color-mix(in srgb, ${vars.colors.warning} 15%, transparent)` }],
  Active: [baseBadge, { color: vars.colors.accent, backgroundColor: `color-mix(in srgb, ${vars.colors.accent} 12%, transparent)` }],
  Canceled: [baseBadge, { color: vars.colors.text3, backgroundColor: vars.colors.neutral }],
  Defeated: [baseBadge, { color: vars.colors.negative, backgroundColor: `color-mix(in srgb, ${vars.colors.negative} 12%, transparent)` }],
  Succeeded: [baseBadge, { color: vars.colors.positive, backgroundColor: `color-mix(in srgb, ${vars.colors.positive} 12%, transparent)` }],
  Queued: [baseBadge, { color: vars.colors.accent, backgroundColor: `color-mix(in srgb, ${vars.colors.accent} 8%, transparent)` }],
  Expired: [baseBadge, { color: vars.colors.text3, backgroundColor: vars.colors.neutral }],
  Executed: [baseBadge, { color: vars.colors.positive, backgroundColor: `color-mix(in srgb, ${vars.colors.positive} 18%, transparent)` }],
  Vetoed: [baseBadge, { color: vars.colors.negative, backgroundColor: `color-mix(in srgb, ${vars.colors.negative} 12%, transparent)` }],
})

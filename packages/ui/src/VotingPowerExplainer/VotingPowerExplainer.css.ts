import { atoms, vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const container = style([
  atoms({
    display: 'flex',
    alignItems: 'flex-start',
    borderRadius: 'curved',
    borderStyle: 'solid',
    borderWidth: 'thin',
    gap: 'x3',
  }),
  {
    padding: '14px 16px',
    borderColor: `color-mix(in srgb, ${vars.colors.accent} 25%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${vars.colors.accent} 6%, transparent)`,
  },
])

export const iconWrap = style([
  atoms({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'round',
    flexShrink: 0,
  }),
  {
    width: 28,
    height: 28,
    backgroundColor: `color-mix(in srgb, ${vars.colors.accent} 14%, transparent)`,
    color: vars.colors.accent,
  },
])

export const title = style({
  fontSize: '14px',
  fontWeight: 600,
  color: vars.colors.text1,
  lineHeight: '20px',
})

export const body = style({
  marginTop: 2,
  fontSize: '13px',
  color: vars.colors.text3,
  lineHeight: '18px',
})

export const scenarioVariants = styleVariants({
  eligible: [container],
  none: [container, {
    borderColor: `color-mix(in srgb, ${vars.colors.text3} 25%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${vars.colors.text3} 6%, transparent)`,
  }],
  delegated: [container, {
    borderColor: `color-mix(in srgb, ${vars.colors.warning} 25%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${vars.colors.warning} 6%, transparent)`,
  }],
  incoming: [container, {
    borderColor: `color-mix(in srgb, ${vars.colors.warning} 25%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${vars.colors.warning} 6%, transparent)`,
  }],
  pending: [container, {
    borderColor: `color-mix(in srgb, ${vars.colors.warning} 25%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${vars.colors.warning} 6%, transparent)`,
  }],
})

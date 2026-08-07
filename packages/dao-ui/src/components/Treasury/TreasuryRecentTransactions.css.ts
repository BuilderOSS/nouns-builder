import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: vars.color.border,
  borderRadius: vars.radii.curved,
  padding: '1.25rem 1.4rem',
})

export const header = style({ marginBottom: '0.35rem' })

export const title = style({ fontSize: '16px', fontWeight: 700, color: vars.color.text1 })

export const sub = style({ fontSize: '12.5px', color: vars.color.text3 })

export const row = style({
  display: 'grid',
  gridTemplateColumns: '26px 1fr auto auto',
  alignItems: 'center',
  gap: '0.75rem',
  paddingTop: '0.7rem',
  paddingBottom: '0.7rem',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderBottomColor: vars.color.border,
  selectors: { '&:last-of-type': { borderBottom: 'none' } },
})

export const badge = style({
  width: '26px',
  height: '26px',
  borderRadius: vars.radii.round,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '13px',
  fontWeight: 700,
  flexShrink: 0,
})

export const badgeIn = style({ background: 'rgba(16,185,129,0.18)', color: '#0a7d55' })
export const badgeOut = style({ background: 'rgba(239,68,68,0.16)', color: '#dc2626' })

export const txTitle = style({
  fontSize: '13.5px',
  color: vars.color.text1,
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const txTag = style({ fontSize: '12px', color: vars.color.text3 })

export const amountIn = style({ fontSize: '13.5px', fontWeight: 600, color: '#0a7d55' })
export const amountOut = style({ fontSize: '13.5px', fontWeight: 600, color: '#dc2626' })

export const time = style({
  fontSize: '12px',
  color: vars.color.text3,
  whiteSpace: 'nowrap',
})

export const viewAll = style({
  marginTop: '0.85rem',
  fontSize: '13px',
  color: vars.color.text3,
  textAlign: 'center',
  textDecoration: 'none',
  selectors: { '&:hover': { color: vars.color.text1 } },
})

export const empty = style({
  padding: '1.75rem 0',
  textAlign: 'center',
  color: vars.color.text3,
  fontSize: '13px',
})

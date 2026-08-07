import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const card = style({ width: '100%' })

export const header = style({
  paddingBottom: '0.75rem',
  marginBottom: '0.25rem',
  borderBottom: `1px solid ${vars.color.border}`,
})

export const title = style({
  fontWeight: 700,
  fontSize: '15px',
  color: vars.color.text1,
})

export const badge = style({
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: '#0a7d55',
  background: 'rgba(16,185,129,0.14)',
  borderRadius: vars.radii.phat,
  padding: '2px 8px',
})

export const total = style({
  fontWeight: 700,
  fontSize: '16px',
  color: vars.color.text1,
})

export const section = style({ marginTop: '0.9rem' })

export const sectionLabel = style({
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.text3,
  marginBottom: '0.6rem',
})

export const milestoneName = style({ fontSize: '13px', color: vars.color.text3 })

export const milestoneAmount = style({
  fontSize: '13px',
  fontWeight: 600,
  color: vars.color.text1,
})

/** A single allocation bar split into one segment per milestone. */
export const stackedBar = style({
  display: 'flex',
  height: '10px',
  width: '100%',
  borderRadius: vars.radii.round,
  overflow: 'hidden',
  background: 'rgba(128,128,128,0.18)',
  marginBottom: '0.85rem',
})

export const segment = style({ height: '100%' })

export const milestoneRow = style({
  paddingTop: '0.3rem',
  paddingBottom: '0.3rem',
})

export const dot = style({
  width: '9px',
  height: '9px',
  borderRadius: vars.radii.round,
  flexShrink: 0,
})

export const partyRow = style({
  paddingTop: '0.4rem',
  paddingBottom: '0.4rem',
  borderTop: `1px solid ${vars.color.border}`,
  selectors: { '&:first-child': { borderTop: 'none' } },
})

export const partyLabel = style({ fontSize: '13px', color: vars.color.text3 })

export const partyValue = style({
  fontSize: '13px',
  color: vars.color.text1,
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '60%',
})

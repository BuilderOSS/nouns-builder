import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const container = style({
  position: 'relative',
  width: '100%',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: vars.color.border,
  borderRadius: vars.radii.curved,
  overflow: 'hidden',
  background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(16,185,129,0.12))',
})

export const svg = style({
  display: 'block',
  width: '100%',
  height: 'auto',
})

export const sourceLabel = style({
  fill: vars.color.text1,
  fontSize: '12px',
  fontWeight: 600,
})

export const sourceSub = style({
  fill: vars.color.text3,
  fontSize: '10px',
})

export const nodeLabel = style({
  fill: vars.color.text1,
  fontSize: '12px',
  fontWeight: 600,
})

export const nodePct = style({
  fill: '#10b981',
  fontSize: '11px',
  fontWeight: 700,
})

export const nodeSub = style({
  fill: vars.color.text3,
  fontSize: '9px',
})

export const emptyState = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  padding: '1rem',
  textAlign: 'center',
  color: vars.color.text3,
  fontSize: '14px',
})

export const legend = style({
  position: 'absolute',
  bottom: '8px',
  right: '10px',
  fontSize: '10px',
  color: vars.color.text3,
})

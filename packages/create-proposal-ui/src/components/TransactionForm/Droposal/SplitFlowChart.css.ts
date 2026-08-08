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

// Recipient nodes are HTML (rendered inside <foreignObject>) so their avatar can
// show a real ENS image with a deterministic gradient fallback — these use
// `color` (HTML) rather than `fill` (SVG text).
export const nodeRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const nodeText = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

export const nodeLabelHtml = style({
  color: vars.color.text1,
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '128px',
})

export const nodePctHtml = style({
  color: '#10b981',
  fontSize: '11px',
  fontWeight: 700,
  lineHeight: 1.2,
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

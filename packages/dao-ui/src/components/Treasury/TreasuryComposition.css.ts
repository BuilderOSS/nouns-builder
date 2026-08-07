import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const layout = style({
  display: 'grid',
  gridTemplateColumns: '320px 1fr',
  gap: '1rem',
  alignItems: 'start',
  '@media': {
    'screen and (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
})

/**
 * Few-asset fallback: the 320px|1fr grid leaves a sparse, lopsided right column
 * when a DAO holds only one or two priced assets. Stack the donut over the
 * rows in a single centered, width-matched column instead so the two pieces
 * line up rather than a narrow donut sitting over a full-width row.
 */
export const layoutStacked = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
  maxWidth: '460px',
  marginLeft: 'auto',
  marginRight: 'auto',
})

export const donutCard = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: vars.color.border,
  borderRadius: vars.radii.curved,
  padding: '1.5rem',
})

export const donutWrap = style({
  position: 'relative',
  width: '240px',
  height: '240px',
})

export const donutSvg = style({
  width: '100%',
  height: '100%',
})

export const donutSlice = style({
  transition: 'stroke-width 0.12s ease',
})

export const donutCenter = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2px',
  pointerEvents: 'none',
})

export const donutCenterLabel = style({
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: vars.color.text3,
})

export const donutCenterValue = style({
  fontSize: '30px',
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: '-0.02em',
  color: vars.color.text1,
})

export const donutCenterSub = style({
  fontSize: '12px',
  color: vars.color.text3,
})

export const rows = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
})

export const row = style({
  display: 'grid',
  gridTemplateColumns: '40px 1.4fr 1fr 1.2fr',
  alignItems: 'center',
  columnGap: '1rem',
  rowGap: '0.5rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: vars.color.border,
  borderRadius: vars.radii.curved,
  padding: '0.85rem 1.1rem',
  '@media': {
    'screen and (max-width: 600px)': {
      gridTemplateColumns: '32px 1fr auto',
    },
  },
})

export const tokenBadge = style({
  width: '36px',
  height: '36px',
  borderRadius: vars.radii.round,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 700,
  color: vars.color.text1,
  background: vars.color.background2,
})

export const rowName = style({ fontWeight: 600, color: vars.color.text1 })
export const rowSub = style({
  fontSize: '12px',
  color: vars.color.text3,
  marginTop: '2px',
})

export const rowBalance = style({
  fontVariantNumeric: 'tabular-nums',
  fontSize: '14px',
  textAlign: 'right',
  color: vars.color.text1,
})

export const rowUsdWrap = style({
  '@media': {
    'screen and (max-width: 600px)': {
      display: 'none',
    },
  },
})

export const rowUsd = style({
  fontVariantNumeric: 'tabular-nums',
  fontSize: '13px',
  textAlign: 'right',
  color: vars.color.text3,
  marginBottom: '4px',
})

export const barTrack = style({
  height: '4px',
  width: '100%',
  borderRadius: vars.radii.round,
  overflow: 'hidden',
  background: vars.color.background2,
})

export const barFill = style({
  height: '100%',
  borderRadius: vars.radii.round,
  transition: 'width 0.2s ease',
})

export const rowPct = style({
  fontSize: '11px',
  textAlign: 'right',
  color: vars.color.text3,
  marginTop: '4px',
  fontVariantNumeric: 'tabular-nums',
})

export const legend = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  marginTop: '1.25rem',
  width: '100%',
})

export const legendItem = style({
  display: 'grid',
  gridTemplateColumns: '14px 1fr auto',
  alignItems: 'center',
  gap: '0.6rem',
  fontSize: '13px',
  color: vars.color.text2,
})

export const legendDot = style({
  width: '12px',
  height: '12px',
  borderRadius: '3px',
})

export const legendPct = style({
  fontVariantNumeric: 'tabular-nums',
  fontSize: '12px',
  color: vars.color.text3,
})

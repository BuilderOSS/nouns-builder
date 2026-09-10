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

export const row = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  gap: '0.75rem',
  paddingTop: '0.6rem',
  paddingBottom: '0.6rem',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderBottomColor: vars.color.border,
})

export const rowLast = style({ borderBottom: 'none' })

export const share = style({
  fontSize: '13.5px',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.text1,
})

export const amount = style({
  fontSize: '20px',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.text1,
})

export const label = style({
  fontSize: '12.5px',
  color: vars.color.text3,
})

export const actions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
  marginTop: '1rem',
})

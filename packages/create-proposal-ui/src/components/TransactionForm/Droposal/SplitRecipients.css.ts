import { vars } from '@buildeross/zord'
import { globalStyle, style } from '@vanilla-extract/css'

export const wrapper = style({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: vars.color.border,
  borderRadius: vars.radii.curved,
  padding: '1rem',
})

export const row = style({
  display: 'grid',
  gridTemplateColumns: '1fr 110px 36px',
  gap: '0.5rem',
  alignItems: 'center',
  marginBottom: '0.5rem',
})

/*
  SmartInput wraps its input in a `<fieldset mb="x8">`; inside a compact
  recipient row that margin would stack up, so collapse it here.
*/
globalStyle(`${row} fieldset`, {
  marginBottom: 0,
})

export const removeBtn = style({
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  color: vars.color.text3,
  fontSize: '18px',
  lineHeight: 1,
  selectors: {
    '&:disabled': { opacity: 0.35, cursor: 'not-allowed' },
  },
})

export const totalRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '0.75rem',
  fontSize: '13px',
})

export const allocBarTrack = style({
  height: '6px',
  width: '100%',
  borderRadius: vars.radii.round,
  overflow: 'hidden',
  background: 'rgba(128,128,128,0.2)',
  marginTop: '0.4rem',
})

export const allocBarFill = style({
  height: '100%',
  borderRadius: vars.radii.round,
  transition: 'width 0.2s ease, background 0.2s ease',
})

export const hintText = style({
  color: vars.color.text3,
  fontSize: '13px',
  marginTop: '0.5rem',
})

export const errorText = style({
  color: vars.color.negative,
  fontSize: '13px',
  marginTop: '0.5rem',
})

export const successBox = style({
  marginTop: '0.75rem',
  padding: '0.75rem',
  borderRadius: vars.radii.curved,
  background: vars.color.positiveDisabled,
  color: vars.color.text1,
  fontSize: '13px',
  wordBreak: 'break-all',
})

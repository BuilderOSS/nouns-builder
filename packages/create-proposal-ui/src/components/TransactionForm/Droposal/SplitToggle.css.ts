import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const card = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: vars.color.border,
  borderRadius: vars.radii.curved,
  padding: '1rem 1.15rem',
})

export const textCol = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

export const title = style({
  fontWeight: 600,
  fontSize: '15px',
  color: vars.color.text1,
})

export const desc = style({
  fontSize: '13px',
  color: vars.color.text3,
  marginTop: '2px',
})

const KNOB = 20
const PAD = 3
const TRACK_W = 46
const TRACK_H = KNOB + PAD * 2

export const track = style({
  position: 'relative',
  flexShrink: 0,
  width: `${TRACK_W}px`,
  height: `${TRACK_H}px`,
  borderRadius: vars.radii.round,
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  transition: 'background 0.15s ease',
})

export const trackOn = style({ background: '#10b981' })
export const trackOff = style({ background: 'rgba(128,128,128,0.35)' })

export const knob = style({
  position: 'absolute',
  top: `${PAD}px`,
  left: `${PAD}px`,
  width: `${KNOB}px`,
  height: `${KNOB}px`,
  borderRadius: vars.radii.round,
  background: '#ffffff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
  transition: 'transform 0.15s ease',
})

export const knobOn = style({
  transform: `translateX(${TRACK_W - KNOB - PAD * 2}px)`,
})

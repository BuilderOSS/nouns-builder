import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const confirmRemoveHeadingStyle = style({
  fontSize: 24,
  lineHeight: '30px',
  fontWeight: 700,
  marginBottom: 8,
})

export const confirmRemoveHelper = style({
  color: vars.color.text3,
  fontSize: 16,
  lineHeight: '24px',
  marginBottom: 8,
})

export const confirmButton = style({
  fontFamily: 'Inter, sans-serif!important',
  width: '100%',
  borderRadius: '12px',
  marginBottom: 8,
})

export const dismissButton = style([
  {
    fontFamily: 'Inter, sans-serif!important',
    width: '100%',
    borderRadius: '12px',
    background: vars.color.background1,
    color: vars.color.text1,
  },
  atoms({
    mb: 'x2',
  }),
])

import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const confirmResetCloseButton = style({
  padding: 0,
  minWidth: 'unset',
  background: 'transparent',
  color: vars.color.text1,
  selectors: {
    '&:hover': { background: 'transparent', color: vars.color.text3 },
  },
})

export const confirmResetHeadingStyle = style({
  fontSize: 24,
  lineHeight: '30px',
  fontWeight: 700,
  marginBottom: 8,
})

export const confirmResetHelperStyle = style({
  color: vars.color.text3,
  fontSize: 16,
  lineHeight: '24px',
  marginBottom: 8,
})

export const confirmResetButton = style({
  fontFamily: 'Inter, sans-serif!important',
  width: '100%',
  borderRadius: '12px',
  marginBottom: 8,
})

export const dismissResetButton = style([
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

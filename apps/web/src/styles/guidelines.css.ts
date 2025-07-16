import { atoms, vars } from '@buildeross/zord'
import { globalStyle, style } from '@vanilla-extract/css'

export const guidelinesContainer = style([
  atoms({ m: 'auto' }),
  {
    maxWidth: '90rem',
  },
])

globalStyle(`${guidelinesContainer} a`, {
  textDecoration: 'underline',
  color: vars.color.accent,
})

globalStyle(`${guidelinesContainer} a:hover, a:active`, {
  color: vars.color.accentActive,
})

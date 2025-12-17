import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const selectorWrapper = style([
  atoms({
    w: '100%',
  }),
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 250px)',
  },
])

export const selectorContent = style({
  maxWidth: '880px',
  width: '100%',
})

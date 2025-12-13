import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const selectorWrapper = style([
  atoms({
    w: '100%',
    py: 'x8',
    px: 'x6',
  }),
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 168px)',
  },
])

export const selectorContent = style({
  maxWidth: '600px',
  width: '100%',
})

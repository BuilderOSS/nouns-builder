import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const contentWrapper = style([
  atoms({
    w: '100%',
    py: 'x6',
    px: 'x6',
  }),
  {
    display: 'flex',
    justifyContent: 'center',
  },
])

export const loadingContainer = style([
  atoms({
    w: '100%',
  }),
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
])

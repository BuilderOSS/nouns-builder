import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const contentWrapper = style([
  atoms({
    w: '100%',
  }),
  {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 250px)',
    maxWidth: '880px',
    margin: '0 auto',
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
    minHeight: 'calc(100vh - 250px)',
  },
])

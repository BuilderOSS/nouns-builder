import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const layoutContainer = style([
  atoms({
    minHeight: '100vh',
    backgroundColor: 'background1',
  }),
])

export const mainContent = style([
  atoms({
    flex: 1,
    pt: 'x8',
    px: 'x4', // Left and right padding
    pb: 'x8',
  }),
])

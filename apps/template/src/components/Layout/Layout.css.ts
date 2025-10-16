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
    px: 'x4', // Left and right padding
  }),
  {
    paddingTop: '80px', // Top padding to account for fixed header
  },
])

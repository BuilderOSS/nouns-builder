import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const mobileProfileContainer = style([
  atoms({
    padding: 'x4',
  }),
  {
    height: '100%',
    overflowY: 'auto',
    paddingBottom: '80px', // Extra space for bottom nav
  },
])

export const viewProfileButton = style({
  width: '100%',
})

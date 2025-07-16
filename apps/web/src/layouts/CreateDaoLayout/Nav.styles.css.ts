import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

import * as z from 'src/utils/layers'

export const NavContainer = style([atoms({ m: 'auto', maxW: '100%' })])

export const NavWrapper = style([
  atoms({
    py: { '@initial': 'x3', '@768': 'x5' },
    px: 'x4',
    backgroundColor: 'background1',
    width: '100%',
    position: 'absolute',
  }),
  {
    height: '80px',
    zIndex: z.NAV_LAYER,
    backgroundColor: 'transparent',
  },
])

export const uploadNotificationWrapper = style({
  '@media': {
    '(max-width: 768px)': {
      background: '#fff',
      bottom: 0,
      paddingTop: 5,
      paddingBottom: 5,
    },
  },
})

import { media } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const responsiveFlex = style([
  {
    flexDirection: 'column',
    alignItems: 'flex-start',
    '@media': {
      [media.min768]: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    },
  },
])

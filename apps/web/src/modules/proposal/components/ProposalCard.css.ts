import { media } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const titleStyle = style([
  {
    order: 2,
    '@media': {
      [media.min768]: { order: 1, flexGrow: 1 },
    },
  },
])

export const statusStyle = style([
  {
    order: 1,
    '@media': {
      [media.min768]: { order: 2 },
    },
  },
])

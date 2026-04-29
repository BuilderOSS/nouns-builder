import { media, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const card = style({
  borderColor: vars.color.primary,
})

export const image = style({
  order: 1,
})

export const btn = style({
  backgroundColor: vars.color.primary,
  order: 2,
  '@media': {
    [media.min768]: { order: 3 },
  },
})

export const content = style({ order: 3, '@media': { [media.min768]: { order: 2 } } })

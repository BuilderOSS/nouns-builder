import { media } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const card = style({
  borderColor: 'rgba(37, 124, 237, 0.4)',
})

export const image = style({
  order: 1,
})

export const btn = style({
  backgroundColor: '#257CED',
  order: 2,
  '@media': {
    [media.min768]: { order: 3 },
  },
})

export const content = style({ order: 3, '@media': { [media.min768]: { order: 2 } } })

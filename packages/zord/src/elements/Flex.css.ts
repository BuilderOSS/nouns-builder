import { globalStyle, style } from '@vanilla-extract/css'

export const flexChildren = style({})

globalStyle(`${flexChildren} > *`, {
  flex: 1,
})

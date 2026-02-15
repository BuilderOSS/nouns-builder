import { style } from '@vanilla-extract/css'

export const graphOnLoadStyles = style({
  opacity: '0',
  strokeDasharray: '1000 1000',
  strokeDashoffset: '1000',
})

export const svgBox = style({
  overflow: 'visible',
})

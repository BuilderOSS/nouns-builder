import { atoms } from '../atoms'
import { style } from '@vanilla-extract/css'

export const box = [
  style({
    fontFeatureSettings: `"liga" 0`,
    boxSizing: 'border-box',
  }),
  atoms({
    fontFamily: 'body',
  }),
]

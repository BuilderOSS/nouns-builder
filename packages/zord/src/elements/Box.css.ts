import { style } from '@vanilla-extract/css'

import { atoms } from '../atoms'

export const box = [
  style({
    fontFeatureSettings: `"liga" 0`,
    boxSizing: 'border-box',
  }),
  atoms({
    fontFamily: 'body',
  }),
]

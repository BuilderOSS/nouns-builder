import { style } from '@vanilla-extract/css'

export const linkStyle = style([
  {
    textDecoration: 'none',
    '::after': {
      display: 'none',
    },
  },
])

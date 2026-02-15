import { style } from '@vanilla-extract/css'

export const linkStyle = style([
  {
    textDecoration: 'none',
    '::after': {
      display: 'none',
    },
  },
])

export const gridStyle = style([
  {
    gridTemplateColumns: '1fr',
    '@media': {
      '(min-width: 768px)': {
        gridTemplateColumns: '1fr 1fr',
      },
    },
  },
])

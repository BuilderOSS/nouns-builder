import { style } from '@vanilla-extract/css'

export const gridStyle = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  '@media': {
    'screen and (min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
})

export const linkStyle = style({
  textDecoration: 'none',
  display: 'inline-block',
  width: 'fit-content',
})

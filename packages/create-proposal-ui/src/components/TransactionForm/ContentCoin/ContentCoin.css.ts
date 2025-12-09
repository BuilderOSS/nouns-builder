import { style } from '@vanilla-extract/css'

export const contentCoinGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '24px',
  width: '100%',
  '@media': {
    '(min-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
})

export const previewColumn = style({
  display: 'block',
  width: '100%',
})

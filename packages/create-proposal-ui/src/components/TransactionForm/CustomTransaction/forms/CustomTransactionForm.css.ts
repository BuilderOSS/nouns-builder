import { style } from '@vanilla-extract/css'

export const transactionFormButtonWithPrev = style({
  marginLeft: 'auto',
  fontFamily: 'Inter, sans-serif!important',
  fontSize: 16,
  borderRadius: '8px',
  padding: '8px 16px',
  height: 'auto',
  minWidth: 66,
  // maxWidth: 66,
})

export const backButton = style({
  background: '#f2f2f2',
  boxSizing: 'border-box',
  width: 'auto',
  height: 40,
  borderRadius: '8px',
  color: '#B3B3B3',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
      color: '#000',
    },
  },
})

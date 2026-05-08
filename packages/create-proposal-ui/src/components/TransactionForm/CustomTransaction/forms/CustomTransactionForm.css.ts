import { vars } from '@buildeross/zord'
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
  background: vars.color.background2,
  boxSizing: 'border-box',
  width: 'auto',
  height: 40,
  borderRadius: '8px',
  color: vars.color.text4,
  selectors: {
    '&:hover': {
      cursor: 'pointer',
      color: vars.color.text1,
    },
  },
})

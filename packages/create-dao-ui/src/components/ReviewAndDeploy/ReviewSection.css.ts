import { vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

const reviewSectionStyle = style({
  backgroundColor: vars.color.background2,
  boxSizing: 'border-box',
  border: `1px solid ${vars.color.border}`,
  selectors: {
    '&:hover': {
      cursor: 'pointer',
      borderColor: vars.color.text1,
    },
  },
  '@media': {
    '(max-width: 768px)': {
      padding: '10px',
    },
  },
})

export const reviewSectionStyleVariants = styleVariants({
  open: [reviewSectionStyle, { background: vars.color.background1 }],
  default: [reviewSectionStyle],
})

export const reviewSectionSubHeading = style({
  margin: 0,
  width: '100%',
  fontSize: 23,
  fontWeight: 700,
  borderRadius: '16px',
  backgroundColor: vars.color.background2,
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

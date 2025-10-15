import { style, styleVariants } from '@vanilla-extract/css'

const reviewSectionStyle = style({
  backgroundColor: '#F3F3F3',
  boxSizing: 'border-box',
  border: '1px solid #E2E3E8',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
      borderColor: '#000',
    },
  },
  '@media': {
    '(max-width: 768px)': {
      padding: '10px',
    },
  },
})

export const reviewSectionStyleVariants = styleVariants({
  open: [reviewSectionStyle, { background: 'rgba(243, 243, 243, 0.5)' }],
  default: [reviewSectionStyle],
})

export const reviewSectionSubHeading = style({
  margin: 0,
  width: '100%',
  fontSize: 23,
  fontWeight: 700,
  borderRadius: '16px',
  backgroundColor: '#F3F3F3',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

import { style } from '@vanilla-extract/css'

export const proposalFormTitle = style({
  lineHeight: 1,
  fontWeight: 700,
  fontSize: '20px',
  '@media': {
    '(min-width: 768px)': {
      fontSize: '28px',
    },
  },
})

export const delegateBtn = style({
  fontFamily: 'ptRoot !important',
  height: '40px !important',
  color: '#000 !important',
  backgroundColor: '#FFF !important',
  ':hover': {
    backgroundColor: '#F9F9F9 !important',
  },
  '@media': {
    '(max-width: 420px)': {
      paddingLeft: '8px !important',
      paddingRight: '8px !important',
    },
  },
})

export const currentDelegateBtn = style({
  backgroundColor: '#FFF !important',
  ':hover': {
    backgroundColor: '#F9F9F9 !important',
  },
})

export const createProposalBtn = style({
  fontFamily: 'ptRoot !important',
  height: '40px !important',
  '@media': {
    '(max-width: 420px)': {
      paddingLeft: '8px !important',
      paddingRight: '8px !important',
    },
  },
})

import { vars } from '@buildeross/zord'
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
  color: `${vars.color.text1} !important`,
  backgroundColor: `${vars.color.background1} !important`,
  ':hover': {
    backgroundColor: `${vars.color.background2} !important`,
  },
  '@media': {
    '(max-width: 420px)': {
      paddingLeft: '8px !important',
      paddingRight: '8px !important',
    },
  },
})

export const currentDelegateBtn = style({
  backgroundColor: `${vars.color.background1} !important`,
  ':hover': {
    backgroundColor: `${vars.color.background2} !important`,
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

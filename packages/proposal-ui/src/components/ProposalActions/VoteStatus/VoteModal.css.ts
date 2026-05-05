import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const voteModalFormTitle = style({
  lineHeight: 1,
  fontWeight: 700,
  fontSize: '20px',
  '@media': {
    '(min-width: 768px)': {
      fontSize: '28px',
    },
  },
})

export const voteModalFieldset = style({
  outline: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
})

export const voteModalRadioInput = style({
  opacity: 0,
  height: 0,
  width: 0,
  margin: 0,
  padding: 0,
})

export const voteModalOption = style({
  border: '2px solid transparent',
  transition: 'all 100ms',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      borderColor: vars.color.text1,
    },
    '&[data-is-active-negative="true"]': {
      backgroundColor: vars.color.negative,
      color: vars.color.onNegative,
      borderColor: `${vars.color.negative} !important`,
    },
    '&[data-is-active-positive="true"]': {
      backgroundColor: vars.color.positive,
      color: vars.color.onPositive,
      borderColor: `${vars.color.positive} !important`,
    },
    '&[data-is-active-neutral="true"]': {
      backgroundColor: vars.color.neutral,
      borderColor: vars.color.text1,
    },
  },
})

export const voteModalOptionText = style({
  fontWeight: 700,
  fontSize: '16px',
  '@media': {
    '(min-width: 768px)': {
      fontSize: '18px',
    },
  },
})

export const voteModalReason = style({
  outline: 'none',
  border: '1px solid transparent',
  appearance: 'none',
  resize: 'none',
})

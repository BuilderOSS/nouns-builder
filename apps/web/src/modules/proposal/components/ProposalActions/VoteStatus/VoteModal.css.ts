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
      borderColor: '#000000',
    },
    '&[data-is-active-negative="true"]': {
      backgroundColor: '#F03232',
      color: '#ffffff',
      borderColor: '#F03232 !important',
    },
    '&[data-is-active-positive="true"]': {
      backgroundColor: '#1CB687',
      color: '#ffffff',
      borderColor: '#1CB687 !important',
    },
    '&[data-is-active-neutral="true"]': {
      backgroundColor: vars.color.neutral,
      borderColor: '#000000',
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

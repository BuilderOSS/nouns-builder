import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const swapInputContainer = style([
  atoms({
    p: 'x4',
    borderRadius: 'phat',
    backgroundColor: 'background1',
  }),
])

export const swapInput = style({
  fontSize: '1.5rem',
  fontWeight: 500,
  border: 'none',
  backgroundColor: 'transparent',
  ':focus': {
    outline: 'none',
  },
})

export const swapButton = style({
  fontSize: '1rem',
  fontWeight: 600,
})

export const maxButton = style([
  atoms({
    px: 'x3',
    py: 'x2',
    borderRadius: 'curved',
  }),
  {
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
])

export const messageText = style({
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'pre-wrap',
})

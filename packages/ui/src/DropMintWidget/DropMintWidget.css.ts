import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const widgetContainer = style([
  atoms({
    p: 'x6',
    borderRadius: 'phat',
    backgroundColor: 'background2',
  }),
])

export const mintInputContainer = style([
  atoms({
    p: 'x4',
    borderRadius: 'phat',
    backgroundColor: 'background1',
  }),
])

export const mintInput = style({
  fontSize: '1rem',
  fontWeight: 500,
  border: 'none',
  backgroundColor: 'transparent',
  textAlign: 'center',
  width: '80px',
})

export const mintButton = style({
  fontSize: '1rem',
  fontWeight: 600,
  width: '100%',
})

export const quantityButton = style({
  minWidth: '40px',
  fontSize: '1.25rem',
})

export const errorMessage = style([
  atoms({
    color: 'negative',
  }),
  {
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
])

export const successMessage = style([
  atoms({
    color: 'positive',
  }),
  {
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
])

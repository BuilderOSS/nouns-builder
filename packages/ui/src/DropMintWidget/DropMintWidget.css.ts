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
  fontSize: '1.125rem',
  fontWeight: 600,
  border: '2px solid transparent',
  backgroundColor: 'transparent',
  textAlign: 'center',
  width: '100%',
  flex: 1,
  borderRadius: '8px',
  padding: '8px 12px',
  transition: 'all 0.2s ease',
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: '#E6E6E6',
      backgroundColor: 'white',
    },
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '&[type=number]': {
      MozAppearance: 'textfield',
    },
  },
})

export const quantityInputWrapper = style([
  atoms({
    backgroundColor: 'background1',
    borderRadius: 'curved',
    p: 'x2',
  }),
  {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '2px solid transparent',
    transition: 'border-color 0.2s ease',
  },
])

export const mintButton = style({
  fontSize: '1rem',
  fontWeight: 600,
  width: '100%',
})

export const quantityButton = style({
  minWidth: '44px',
  height: '44px',
  fontSize: '1.25rem',
  fontWeight: 700,
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.4,
    },
  },
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

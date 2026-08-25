import { atoms, theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const container = style([
  atoms({
    padding: 'x6',
    borderRadius: 'curved',
    borderWidth: 'thin',
  }),
  {
    backgroundColor: theme.colors.background2,
    borderColor: theme.colors.border,
  },
])

export const signerRow = style([
  atoms({
    padding: 'x3',
    borderRadius: 'small',
  }),
  {
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: theme.colors.background1,
    },
  },
])

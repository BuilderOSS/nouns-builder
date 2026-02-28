import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const commentFormContainer = style([
  atoms({
    w: '100%',
    backgroundColor: 'background2',
    borderRadius: 'curved',
    mb: 'x5',
  }),
])

export const commentFormError = style([
  atoms({
    color: 'negative',
  }),
  {
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
])

export const commentFormSuccess = style([
  atoms({
    color: 'positive',
  }),
  {
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
])

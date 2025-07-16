import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const previewTextStyle = style({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxWidth: '400px',
})

export const defaultInputLabelStyle = style([
  atoms({
    display: 'inline-flex',
    fontSize: 16,
    mb: 'x4',
  }),
  {
    whiteSpace: 'nowrap',
    fontWeight: '700',
  },
])

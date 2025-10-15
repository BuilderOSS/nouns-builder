import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const propPageWrapper = style([
  atoms({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  }),
  {
    maxWidth: 912,
    margin: '0 auto',
    '@media': {
      '(min-width: 768px)': {
        margin: '0 auto',
      },
    },
  },
])

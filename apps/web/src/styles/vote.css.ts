import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const votePageWrapper = style([
  atoms({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  }),
  {
    maxWidth: 912,
    margin: '0 auto',
  },
])

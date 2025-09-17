import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const artworkPreviewPanel = style([
  atoms({
    position: 'absolute',
    right: 'x0',
    bottom: 'x0',
  }),
  {
    minHeight: 'auto',
    width: 'auto',
    background: '#fff',
    '@media': {
      'screen and (max-width: 768px)': {
        width: '100%',
        height: 'auto',
        position: 'relative',
        border: 0,
        minHeight: 'auto',
        padding: '20px 0',
      },
    },
  },
])

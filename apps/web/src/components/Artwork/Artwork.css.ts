import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const artworkPreviewPanel = style([
  atoms({
    position: 'fixed',
    left: 'x0',
    top: 'x0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  {
    minHeight: '100vh',
    width: '50vw',
    borderRight: '2px solid #F2F2F2',
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

export const artworkPreviewImageWrapper = style({
  width: 448,
  height: 448,
  background: '#f2f2f2',
  borderRadius: '12px',
  overflow: 'hidden',
  '@media': {
    'screen and (max-width: 1000px)': {
      width: (448 * 3) / 4,
      height: (448 * 3) / 4,
    },
    'screen and (max-width: 768px)': {
      width: '100%',
      height: '100%',
    },
  },
})

export const artworkPreviewGenerateButton = style({
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

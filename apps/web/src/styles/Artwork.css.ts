import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

import { skeletonAnimation } from './animations.css'

export const artworkSkeleton = style({
  animation: skeletonAnimation,
})

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

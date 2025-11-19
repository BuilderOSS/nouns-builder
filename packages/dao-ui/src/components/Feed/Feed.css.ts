import { skeletonAnimation } from '@buildeross/ui/styles'
import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const feed = style([
  atoms({
    m: 'auto',
  }),
  {
    maxWidth: 912,
  },
])

export const castCardStyle = style({})

export const cardSkeleton = style({
  animation: skeletonAnimation,
  height: '10rem',
  marginBottom: '1.6rem',
})

export const cardWrapper = style({
  width: '100%',
  transition: 'all 0.15s ease-in-out',
  position: 'relative',
  selectors: {
    '&:hover': {
      backgroundColor: '#fafafa',
      cursor: 'pointer',
    },
  },
})
export const loadMoreButton = style({
  width: '100%',
})

export const pfpStyles = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  height: '100%',
  width: '100%',
  transform: 'translate(-50%, -50%)',
  objectFit: 'cover',
  borderRadius: '50%',
})
export const pfpWrapper = style({
  width: '32px',
  height: '32px',
  position: 'relative',
  overflow: 'hidden',
})
export const castText = style({
  wordBreak: 'break-word',
  whiteSpace: 'break-spaces',
})
export const cardLink = style({
  textDecoration: 'none',
  color: 'inherit',
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
})

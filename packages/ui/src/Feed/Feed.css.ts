import { atoms, color, space } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const feedItemCard = style([
  atoms({
    p: 'x4',
    borderRadius: 'curved',
    borderWidth: 'normal',
    borderStyle: 'solid',
    borderColor: 'border',
    backgroundColor: 'background1',
    w: '100%',
  }),
  {
    transition: 'all 0.15s ease-in-out',
    ':hover': {
      borderColor: color.border,
      boxShadow: `0 2px 8px ${color.ghostHover}`,
    },
  },
])

export const feedItemIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: space.x10,
  height: space.x10,
  borderRadius: '50%',
  backgroundColor: color.background2,
  flexShrink: 0,
})

export const feedItemTitle = atoms({
  fontWeight: 'display',
  fontSize: 18,
  color: 'text1',
})

export const feedItemSubtitle = atoms({
  fontSize: 16,
  color: 'text2',
})

export const feedItemDescription = atoms({
  color: 'text3',
  fontSize: 14,
})

export const feedItemMeta = atoms({
  fontSize: 14,
  color: 'text3',
})

export const feedItemActorName = style({
  textDecoration: 'none',
  color: color.text2,
  ':hover': {
    color: color.accent,
  },
})

export const tokenImage = style([
  atoms({
    borderRadius: 'curved',
    overflow: 'hidden',
  }),
  {
    width: 80,
    height: 80,
    objectFit: 'cover',
  },
])

import { atoms, space, theme } from '@buildeross/zord'
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
      borderColor: theme.colors.tertiary,
      boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
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
  backgroundColor: theme.colors.background2,
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

export const feedItemMeta = atoms({
  color: 'text3',
  fontSize: 14,
})

export const feedItemActorName = style({
  textDecoration: 'none',
  color: theme.colors.text2,
  ':hover': {
    color: theme.colors.accent,
  },
})

export const feedItemImage = style([
  atoms({
    borderRadius: 'curved',
    overflow: 'hidden',
    w: '100%',
  }),
  {
    aspectRatio: '1 / 1',
    objectFit: 'cover',
  },
])

export const feedItemTextContentWrapper = style([
  {
    width: '100%',
    containerType: 'inline-size',
  },
])

export const feedItemTextContent = style([
  atoms({
    p: 'x4',
    borderRadius: 'curved',
    backgroundColor: 'border',
  }),
  {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100cqw',
    overflow: 'auto',
    fontSize: 14,
  },
])

import { atoms, color, space, vars } from '@buildeross/zord'
import { globalStyle, style } from '@vanilla-extract/css'

export const selectorContainer = style({
  width: '100%',
})

export const daoList = style({
  maxHeight: '400px',
  overflowY: 'auto',
})

export const sectionTitle = style({
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: space.x3,
  color: color.text1,
})

export const daoItem = style([
  atoms({
    padding: 'x3',
    borderRadius: 'curved',
  }),
  {
    display: 'flex',
    alignItems: 'center',
    gap: space.x3,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    marginBottom: space.x2,

    backgroundColor: color.background2,

    ':hover': {
      backgroundColor: vars.color.background2,
    },
  },
])

globalStyle(`html[data-theme-mode='dark'] ${daoItem}`, {
  backgroundColor: vars.color.background2,
})

globalStyle(`html[data-theme-mode='dark'] ${daoItem}:hover`, {
  backgroundColor: vars.color.neutralHover,
})

export const daoImage = style({
  borderRadius: '4px',
  flexShrink: 0,
  objectFit: 'cover',
})

export const daoInfo = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: space.x1,
})

export const daoAddress = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const emptyState = style({
  padding: space.x6,
  textAlign: 'center',
  color: color.text3,
  fontSize: '14px',
})

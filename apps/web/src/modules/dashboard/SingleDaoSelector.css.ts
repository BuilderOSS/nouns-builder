import { atoms, color, space } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

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
  color: color.text2,
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

    ':hover': {
      backgroundColor: color.background2,
    },
  },
])

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

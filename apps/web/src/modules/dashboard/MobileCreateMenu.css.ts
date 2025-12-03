import { atoms, color, space } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const createMenuContainer = style([
  atoms({
    padding: 'x6',
  }),
  {
    height: '100%',
    overflowY: 'auto',
  },
])

export const createMenuTitle = style({
  fontSize: '24px',
  fontWeight: 600,
  marginBottom: space.x6,
})

export const createMenuGrid = style({
  display: 'grid',
  gap: space.x4,
  gridTemplateColumns: '1fr',
})

export const createMenuCard = style([
  atoms({
    padding: 'x6',
    borderRadius: 'curved',
    borderStyle: 'solid',
    borderWidth: 'normal',
    borderColor: 'border',
  }),
  {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: space.x3,
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    textDecoration: 'none',
    transition: 'all 0.2s ease',

    ':hover': {
      borderColor: color.neutralHover,
      boxShadow: `0 4px 12px ${color.ghostHover}`,
      transform: 'translateY(-2px)',
    },

    ':active': {
      transform: 'translateY(0)',
    },
  },
])

export const createMenuCardIcon = style({
  width: '40px',
  height: '40px',
  color: color.accent,
})

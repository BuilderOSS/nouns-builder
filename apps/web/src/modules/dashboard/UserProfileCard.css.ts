import { atoms, color, space } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const profileCard = style([
  atoms({
    padding: 'x4',
    borderRadius: 'curved',
    borderStyle: 'solid',
    borderWidth: 'normal',
    borderColor: 'border',
  }),
  {
    transition: 'border-color 0.15s ease',
    ':hover': {
      borderColor: color.neutralHover,
    },
  },
])

export const profileInfo = style({
  flex: 1,
  minWidth: 0,
})

export const statsRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: space.x2,
})

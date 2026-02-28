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
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    ':hover': {
      backgroundColor: color.border,
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

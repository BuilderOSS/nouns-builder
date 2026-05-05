import { atoms, color, space, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

const dashboardActionGrey = vars.color.background2

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
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
    ':hover': {
      backgroundColor: color.background2,
      borderColor: color.background2,
    },
    selectors: {
      'html[data-theme-mode="dark"] &:hover': {
        backgroundColor: dashboardActionGrey,
        borderColor: dashboardActionGrey,
      },
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

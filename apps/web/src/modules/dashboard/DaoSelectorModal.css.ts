import { atoms, space, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const modalHeader = style([
  atoms({
    padding: 'x4',
    borderColor: 'border',
  }),
  {
    borderBottom: `1px solid ${vars.color.border}`,
  },
])

export const modalTitle = style({
  fontSize: '24px',
  fontWeight: 600,
})

export const modalBody = style([
  atoms({
    padding: 'x4',
  }),
])

export const modalFooter = style([
  atoms({
    padding: 'x4',
    borderColor: 'border',
  }),
  {
    borderTop: `1px solid ${vars.color.border}`,
    justifyContent: 'space-between',
    gap: space.x3,
  },
])

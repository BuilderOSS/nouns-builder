import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const filterButton = style([
  atoms({
    gap: 'x1',
  }),
  {
    display: 'flex',
    alignItems: 'center',
  },
])

export const filterPopup = style([
  atoms({
    minWidth: 'x64',
  }),
  {
    maxHeight: '300px',
    overflowY: 'auto',
  },
])

export const filterItem = style([
  atoms({
    cursor: 'pointer',
    pt: 'x1',
    pb: 'x1',
    px: 'x2',
    borderRadius: 'small',
  }),
  {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: vars.color.background2,
    },
  },
])

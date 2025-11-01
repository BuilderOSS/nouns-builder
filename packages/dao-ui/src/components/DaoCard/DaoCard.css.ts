import { atoms, color } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const daoImage = style({
  '::after': {
    boxShadow: '0px 0px 0px 2px rgba(0, 0, 0, 0.04) inset',
    content: '',
    display: 'block',
    height: '100%',
    position: 'absolute',
    top: 0,
    width: '100%',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    pointerEvents: 'none',
  },
})

export const border = style({
  border: `2px solid ${color.border}`,
  borderTop: 'none',
})

export const title = style([border])

export const name = style([
  atoms({ overflow: 'hidden', whiteSpace: 'nowrap' }),
  {
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
  },
])

export const auction = style([
  border,
  {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
])

export const detail = style({
  flexBasis: '50%',
  flexGrow: 0,
})

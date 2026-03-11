import { atoms, color } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const checkboxStyle = style([
  {
    minHeight: 26,
    height: 26,
    width: 26,
    minWidth: 26,
    borderRadius: '5px',
    cursor: 'pointer',
    selectors: {
      '&:hover': { background: color.negative },
    },
  },
  atoms({
    borderWidth: 'thin',
    borderStyle: 'solid',
    borderColor: 'negative',
  }),
])

export const checkboxStyleVariants = styleVariants({
  default: [checkboxStyle],
  confirmed: [checkboxStyle, atoms({ backgroundColor: 'negative' })],
})

export const checkboxHelperText = style([
  atoms({
    display: 'inline',
    color: 'negative',
  }),
  {
    lineHeight: '24px',
    fontSize: '14px',
    fontWeight: 700,
  },
])

export const checkboxLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  cursor: 'pointer',
})

export const visuallyHiddenCheckbox = style({
  position: 'absolute',
  opacity: 0,
  width: 1,
  height: 1,
  margin: 0,
  pointerEvents: 'none',
})

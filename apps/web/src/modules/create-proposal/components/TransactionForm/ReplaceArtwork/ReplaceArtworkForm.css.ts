import { atoms } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const checkboxWrapperStyle = style({
  borderRadius: '16px',
  border: `1px solid #F2F2F2`,
})

export const checkboxStyle = style({
  minHeight: 26,
  height: 26,
  width: 26,
  minWidth: 26,
  border: `1px solid #000`,
  borderRadius: '5px',
  selectors: {
    '&:hover': { cursor: 'pointer', background: '#000' },
  },
})

export const checkboxStyleVariants = styleVariants({
  default: [checkboxStyle],
  confirmed: [checkboxStyle, { background: '#000' }],
})

export const checkboxHelperText = style([
  atoms({
    display: 'inline',
  }),
  {
    lineHeight: '24px',
    color: '#808080',
    fontSize: '14px',
  },
])

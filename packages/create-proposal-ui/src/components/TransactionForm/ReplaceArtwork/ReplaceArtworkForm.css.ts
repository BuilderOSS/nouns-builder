import { atoms, vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const checkboxWrapperStyle = style({
  borderRadius: '16px',
  border: `1px solid ${vars.color.background2}`,
})

export const checkboxStyle = style({
  minHeight: 26,
  height: 26,
  width: 26,
  minWidth: 26,
  border: `1px solid ${vars.color.text1}`,
  borderRadius: '5px',
  selectors: {
    '&:hover, &:focus-visible': { cursor: 'pointer', background: vars.color.text1 },
  },
})

export const checkboxStyleVariants = styleVariants({
  default: [checkboxStyle],
  confirmed: [checkboxStyle, { background: vars.color.text1 }],
})

export const checkboxHelperText = style([
  atoms({
    display: 'inline',
  }),
  {
    lineHeight: '24px',
    color: vars.color.text3,
    fontSize: '14px',
  },
])

import { atoms, vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const toggleStyle = style([
  atoms({
    width: 'x12',
    height: 'x6',
    borderRadius: 'round',
  }),
  {
    border: `2px solid ${vars.color.text1}`,
    boxSizing: 'border-box',
    selectors: {
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
])

export const toggleContainer = styleVariants({
  off: [
    toggleStyle,
    { justifyContent: 'flex-start', background: vars.color.background1 },
  ],
  on: [toggleStyle, { justifyContent: 'flex-end', background: vars.color.text1 }],
})

export const plainToggleButton = style([
  {
    border: `2px solid ${vars.color.text1}`,
    background: vars.color.background2,
    marginTop: '-2px',
    marginLeft: '-2px',
    marginRight: '-2px',
  },
])

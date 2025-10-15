import { atoms } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const toggleStyle = style([
  atoms({
    width: 'x12',
    height: 'x6',
    borderRadius: 'round',
  }),
  {
    border: '2px solid #000',
    boxSizing: 'border-box',
    selectors: {
      '&:hover': {
        cursor: 'pointer',
      },
    },
    // width: '42px',
  },
])

export const allocationToggle = styleVariants({
  off: [toggleStyle, { justifyContent: 'flex-start', background: '#FFF' }],
  on: [toggleStyle, { justifyContent: 'flex-end', background: '#000' }],
})

export const allocationToggleButton = style({
  border: '2px solid #000',
  marginTop: '-2px',
  background: '#FFF',
})

export const allocationToggleButtonVariants = styleVariants({
  off: [allocationToggleButton, { marginLeft: '-2px' }],
  on: [allocationToggleButton, { marginRight: '-2px' }],
})

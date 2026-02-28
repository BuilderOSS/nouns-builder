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
  },
])

export const toggleContainer = styleVariants({
  off: [toggleStyle, { justifyContent: 'flex-start', background: '#FFF' }],
  on: [toggleStyle, { justifyContent: 'flex-end', background: '#000' }],
})

export const plainToggleButton = style([
  {
    border: '2px solid #000',
    background: '#F2F2F2',
    marginTop: '-2px',
    marginLeft: '-2px',
    marginRight: '-2px',
  },
])

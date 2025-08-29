import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const input = style([
  atoms({
    w: '100%',
    h: 'x14',
    p: 'x4',
    pr: 'x12',
  }),
  {
    fontSize: 16,
    borderRadius: 12,
    border: `2px solid ${vars.color.background2}`,
    backgroundColor: vars.color.background1,
    transition: '0.1s border-color',
    textOverflow: 'ellipsis',
    selectors: {
      '&[data-error="true"]': {
        borderColor: vars.color.negative,
      },
    },
  },
])

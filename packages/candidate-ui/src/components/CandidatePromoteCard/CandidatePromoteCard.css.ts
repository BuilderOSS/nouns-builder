import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const promoteCard = style([
  atoms({
    borderRadius: 'curved',
    borderWidth: 'normal',
    borderStyle: 'solid',
    backgroundColor: 'background2',
  }),
  {
    overflow: 'hidden',
    selectors: {
      '&[data-status="ready"]': {
        borderColor: vars.color.positive,
      },
      '&[data-status="gathering"]': {
        borderColor: vars.color.border,
      },
      '&[data-status="creator-only"]': {
        borderColor: vars.color.border,
      },
    },
  },
])

export const progressContainer = style([
  atoms({
    borderRadius: 'small',
    backgroundColor: 'background1',
  }),
  {
    height: '8px',
    width: '100%',
    overflow: 'hidden',
  },
])

export const progressBar = style({
  height: '100%',
  backgroundColor: vars.color.accent,
  transition: 'width 0.3s ease',
})

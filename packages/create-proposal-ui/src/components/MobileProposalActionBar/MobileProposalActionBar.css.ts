import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const mobileProposalActionBar = style([
  atoms({ backgroundColor: 'background1', p: 'x4' }),
  {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 25,
    borderTop: '1px solid',
    borderColor: vars.color.border,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
    '@media': {
      '(min-width: 768px)': {
        display: 'none',
      },
    },
  },
])

export const mobileActionPrimary = style({
  flex: 1,
})

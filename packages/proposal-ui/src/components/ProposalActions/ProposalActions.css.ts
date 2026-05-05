import { atoms, vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

const proposalActionButton = style([
  atoms({
    fontSize: 16,
    borderRadius: 'curved',
  }),
  {
    padding: '8px 16px',
    maxHeight: 40,
  },
])

export const proposalActionButtonVariants = styleVariants({
  vote: [proposalActionButton],
  voteDisabled: [
    proposalActionButton,
    atoms({
      fontWeight: 'display',
      color: 'text3',
      backgroundColor: 'border',
      justifyContent: 'center',
    }),
  ],
  cancel: [
    proposalActionButton,
    {
      background: vars.color.background2,
      color: vars.color.text1,
      minWidth: 149,
    },
  ],
  queue: [
    proposalActionButton,
    {
      background: vars.color.secondary,
      width: '100%',
    },
  ],
  execute: [
    proposalActionButton,
    {
      background: vars.color.primary,
      width: '100%',
    },
  ],
})

export const cancelButtonBorder = style({
  borderTop: `2px solid ${vars.color.background2}`,
  '@media': {
    '(min-width: 768px)': {
      borderTop: 'none',
    },
  },
})

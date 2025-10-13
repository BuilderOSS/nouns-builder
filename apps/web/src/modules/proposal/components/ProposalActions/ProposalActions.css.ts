import { atoms } from '@buildeross/zord'
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
      background: '#F2F2F2',
      color: '#000000',
      minWidth: 149,
    },
  ],
  queue: [
    proposalActionButton,
    {
      background: '#D16BE1',
      width: '100%',
    },
  ],
  execute: [
    proposalActionButton,
    {
      background: '#257CED',
      width: '100%',
    },
  ],
})

export const cancelButtonBorder = style({
  borderTop: '2px solid #F2F2F2',
  '@media': {
    '(min-width: 768px)': {
      borderTop: 'none',
    },
  },
})

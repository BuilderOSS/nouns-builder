import { atoms, media } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const proposalTileSubtitle = style([
  atoms({
    fontWeight: 'display',
    fontSize: 20,
  }),
  {
    '@media': {
      [media.min768]: { fontSize: 24 },
    },
  },
])

export const proposalTileSubtitleVariants = styleVariants({
  default: [proposalTileSubtitle],
  for: [proposalTileSubtitle, atoms({ color: 'positive' })],
  against: [proposalTileSubtitle, atoms({ color: 'negative' })],
  abstain: [proposalTileSubtitle, atoms({ color: 'text3' })],
})

export const voteProgress = style([
  atoms({
    h: 'x2',
    borderRadius: 'round',
    backgroundColor: 'border',
  }),
])

export const voteProgressVariants = styleVariants({
  for: [voteProgress, atoms({ backgroundColor: 'positive' })],
  against: [voteProgress, atoms({ backgroundColor: 'negative' })],
  abstain: [voteProgress, atoms({ backgroundColor: 'text3' })],
})

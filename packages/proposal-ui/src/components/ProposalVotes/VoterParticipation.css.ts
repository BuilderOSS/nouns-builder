import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const VoterParticipationVariants = {
  positive: atoms({ color: 'positive' }),
  neutral: style({ color: '#FF8E38' }),
}

export const votePlacardReason = style({
  gridColumn: 'span 7 / span 7',
  '@media': {
    'screen and (min-width: 768px)': {
      gridColumn: '2 / span 6',
    },
  },
})

import { atoms, vars } from '@buildeross/zord'
import { globalStyle, style } from '@vanilla-extract/css'

export const VoterParticipationVariants = {
  positive: atoms({ color: 'positive' }),
  neutral: style({ color: vars.color.warning }),
}

export const votePlacardReason = style({
  gridColumn: 'span 7 / span 7',
  '@media': {
    'screen and (min-width: 768px)': {
      gridColumn: '2 / span 6',
    },
  },
})

globalStyle(`html[data-theme-mode='dark'] ${votePlacardReason} > *`, {
  backgroundColor: `${vars.color.background2} !important`,
  color: `${vars.color.text1} !important`,
})

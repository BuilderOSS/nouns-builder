import { vars } from '@buildeross/zord'
import { keyframes, style } from '@vanilla-extract/css'

export const uploadingSpinnerWhite = style({
  display: 'inline-block',
  selectors: {
    '&::after': {
      display: 'block',
      content: "' '",
      width: 20,
      height: 20,
      margin: 4,
      borderRadius: '50%',
      border: `3px solid ${vars.color.onAccent}`,
      borderColor: `${vars.color.onAccent} ${vars.color.onAccent} ${vars.color.onAccent} transparent`,
      animation: `${keyframes({
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      })} 1.5s linear infinite`,
    },
  },
})

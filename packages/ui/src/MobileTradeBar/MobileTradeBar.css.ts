import { MOBILE_BOTTOM_NAV_LAYER } from '@buildeross/constants/layers'
import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const mobileTradeBar = style([
  atoms({
    backgroundColor: 'background1',
    p: 'x4',
  }),
  {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: MOBILE_BOTTOM_NAV_LAYER,
    borderTop: '1px solid',
    borderColor: vars.color.border,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    '@media': {
      'screen and (min-width: 1024px)': {
        display: 'none',
      },
    },
  },
])

export const priceDisplay = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
})

export const tradeButton = style({
  minWidth: 120,
  flex: 1,
})

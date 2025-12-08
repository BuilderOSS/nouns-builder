import { skeletonAnimation } from '@buildeross/ui/styles'
import { atoms, theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const outerAuctionCard = style([
  atoms({
    width: '100%',
    marginBottom: 'x3',
    borderColor: 'border',
    borderStyle: 'solid',
    borderRadius: 'curved',
    borderWidth: 'normal',
    py: 'x3',
    px: 'x3',
  }),
  {
    transition: 'border-color 0.15s ease-in-out',
    borderColor: theme.colors.border,
    ':hover': {
      borderColor: theme.colors.neutralHover,
      boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
    },
  },
])

export const proposalCardVariants = {
  default: style({
    transition: 'border-color 0.15s ease-in-out',
    borderColor: theme.colors.border,
    ':hover': {
      borderColor: theme.colors.neutralHover,
      boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
    },
  }),
  warning: style({
    transition: 'border-color 0.15s ease-in-out',
    borderColor: theme.colors.warning,
    ':hover': {
      borderColor: theme.colors.warningHover,
      boxShadow: `0 2px 8px ${theme.colors.ghostHover}`,
    },
  }),
}

export const daoTokenName = style([
  {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  atoms({
    overflow: 'hidden',
    fontWeight: 'label',
    fontSize: 16,
  }),
])

export const daoAvatar = style([
  atoms({
    objectFit: 'contain',
    borderRadius: 'curved',
    height: 'x12',
    width: 'x12',
  }),
])
export const daoAvatarBox = style({
  marginRight: '12px',
  width: '48px',
  height: '48px',
})

export const bidBox = style({
  width: '100%',
})

export const bidInput = style([
  {
    outline: 'none',
    boxSizing: 'border-box',
    transition: '.3s',
    selectors: {
      '&::placeholder': {
        color: theme.colors.tertiary,
      },
    },
  },
  atoms({
    borderWidth: 'none',
    borderRadius: 'curved',
    height: 'x10',
    width: '100%',
    paddingLeft: 'x3',
    paddingRight: 'x10',
    backgroundColor: 'background2',
    fontSize: 14,
    lineHeight: 24,
  }),
])

export const feed = style([
  atoms({
    m: 'auto',
  }),
  {
    maxWidth: 912,
  },
])

export const auctionCardSkeleton = style({
  animation: skeletonAnimation,
  height: '96px',
})

export const daoCardSkeleton = style({
  animation: skeletonAnimation,
  height: '52px',
  width: '175px',
})

export const proposalCardSkeleton = style({
  animation: skeletonAnimation,
  height: '88px',
})
export const minButton = style({
  minWidth: 'fit-content',
  fontWeight: 500,
  paddingLeft: 0,
  paddingRight: 0,
  top: 0,
  right: 0,
  bottom: 0,
})
export const daoName = style({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '250px',
  '@media': {
    'screen and (min-width: 1024px)': {
      maxWidth: '200px',
    },
    'screen and (max-width: 484px)': {
      maxWidth: '200px',
    },
  },
})

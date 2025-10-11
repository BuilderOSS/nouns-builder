import { atoms, theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'
import { skeletonAnimation } from 'src/styles/animations.css'

export const outerAuctionCard = style([
  {
    '@media': {
      'screen and (max-width: 768px)': {
        gap: '16px',
      },
    },
  },
  atoms({
    width: '100%',
    alignItems: { '@initial': 'flex-start', '@768': 'center' },
    flexDirection: { '@initial': 'column', '@768': 'row' },
    marginBottom: 'x6',
    borderColor: 'border',
    borderStyle: 'solid',
    borderRadius: 'curved',
    borderWidth: 'normal',
    py: { '@initial': 'x4', '@768': 'x3' },
    px: { '@initial': 'x2', '@768': 'x6' },
  }),
])

export const daoTokenName = style([
  {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    width: '200px',
    '@media': {
      'screen and (max-width: 912px)': {
        width: '150px',
      },
      'screen and (max-width:768px)': {
        width: '220px',
      },
    },
  },
  atoms({
    overflow: 'hidden',
    fontWeight: 'label',
    fontSize: 20,
  }),
])

export const daoAvatar = style([
  atoms({
    objectFit: 'contain',
    borderRadius: 'curved',
    height: 'x16',
    width: 'x16',
  }),
])
export const daoAvatarBox = style({
  marginRight: '24px',
  width: '64px',
  height: '64px',
  '@media': {
    'screen and (max-width: 768px)': {
      marginRight: '16px',
    },
  },
})

export const auctionCardBrand = style([
  {
    width: '40%',
    '@media': {
      'screen and (max-width: 912px)': {
        width: '35%',
      },
      'screen and (max-width: 768px)': {
        width: '100%',
      },
    },
  },
  atoms({
    alignItems: 'center',
  }),
])

export const stats = style({
  width: '50%',
})
export const statsBox = style({
  width: '30%',
  '@media': {
    'screen and (max-width: 768px)': {
      width: '80%',
    },
    'screen and (max-width: 484px)': {
      width: '100%',
    },
  },
})

export const bidBox = style([
  {
    width: '250px',
    '@media': {
      'screen and (max-width: 768px)': {
        width: '100%',
        marginLeft: 0,
      },
    },
  },
  atoms({
    marginLeft: 'auto',
  }),
])

export const bidForm = style({
  width: '75%',
})

export const bidButton = style({
  width: '25%',
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
    height: 'x12',
    width: '100%',
    paddingLeft: 'x4',
    paddingRight: 'x11',
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
    'screen and (max-width: 484px)': {
      maxWidth: '200px',
    },
  },
})

import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const heroBannerGrid = style([
  atoms({
    width: '100%',
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  {
    margin: '158px 0px',
    padding: '80px 0',
    maxWidth: '1376px',
    gridTemplateRows: '100%',
    gridTemplateColumns: '50% 50%',
    '@media': {
      'screen and (max-width: 1023px)': {
        justifyItems: 'center',
        margin: '126px 0px',
        padding: '40px 0',
        gridTemplateColumns: '100%',
        gridTemplateRows: '50% 50%',
      },
    },
  },
])

export const heroBannerSplash = style([
  atoms({
    display: 'flex',
    flexDirection: 'column',
  }),
  {
    maxWidth: '475px',
    justifyContent: 'flex-start',
    gridColumnStart: 1,
    gridRowStart: 1,
    alignItems: 'flex-start',
    '@media': {
      'screen and (max-width: 1023px)': {
        marginBottom: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        gridRowStart: 2,
      },
    },
  },
])

export const splashHeading = style([
  atoms({
    fontWeight: 'label',
    mb: 'x5',
  }),
  {
    fontFamily: 'ptRoot, sans-serif!important',
    fontSize: '52px',
    '@media': {
      'screen and (max-width: 1023px)': {
        fontSize: '36px',
      },
    },
  },
])

export const splashCopyDesktop = style([
  atoms({
    mb: 'x5',
  }),
  {
    display: 'flex',
    fontFamily: 'ptRoot, sans-serif!important',
    flexDirection: 'column',
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    '@media': {
      'screen and (max-width: 1023px)': {
        display: 'none',
      },
    },
  },
])

export const splashCopyMobile = style({
  display: 'none',
  fontFamily: 'ptRoot, sans-serif!important',
  lineHeight: 1.5,
  '@media': {
    'screen and (max-width: 1023px)': {
      display: 'flex',
      marginBottom: '20px',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
  },
})

export const heroBannerImageContainer = style({
  minWidth: '834px',
  justifyContent: 'flex-end',
  gridRowStart: 1,
  gridColumnStart: 2,
  marginLeft: '10px',
  '@media': {
    'screen and (max-width: 1023px)': {
      justifySelf: 'center',
      marginLeft: '0px',
      marginBottom: '60px',
      height: '100px',
      minWidth: '270px',
      width: '270px',
      justifyContent: 'center',
      gridColumnStart: 1,
    },
  },
})

export const heroBannerCreateDaoButton = style({
  selectors: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: '#808080',
    },
  },
})

export const exploreCtaContainer = style({
  '@media': {
    'screen and (max-width: 1024px)': {
      flexDirection: 'row',
    },
    'screen and (max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    },
  },
})

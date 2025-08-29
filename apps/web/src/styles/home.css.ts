import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const marqueeButton = style({
  fontFamily: 'ptRoot!important',
  width: 280,
  selectors: {
    '&:hover': {
      color: '#fff',
      backgroundColor: 'rgba(0,0,0,.8)',
    },
  },
  '@media': {
    'screen and (max-width: 768px)': {
      fontSize: 16,
      lineHeight: '24px',
      padding: '12px 24px',
      width: 'auto',
      height: 'auto',
    },
  },
})

export const marqueeItemButton = style([
  atoms({
    fontWeight: 'display',
    alignItems: 'center',
    height: 'x16',
    fontSize: 28,
    py: 'x4',
    px: 'x6',
  }),
  {
    border: '2px solid',
    lineHeight: '32px',
    whiteSpace: 'nowrap',
    borderRadius: '62px',
    '@media': {
      '(max-width: 768px)': {
        fontSize: 16,
        padding: '8px 16px',
        borderRadius: '62px',
        height: 'auto',
      },
    },
  },
])

export const getStartedButton = style({
  fontSize: 26,
  background: 'rgba(255,255,255,.3)',
  selectors: {
    '&:hover': {
      background: 'rgba(255,255,255,.35)',
      cursor: 'pointer',
    },
  },
  '@media': {
    '(max-width: 768px)': {
      fontSize: 16,
      padding: '12px 24px',
    },
  },
})

export const homeFooterLinks = style({
  selectors: {
    '&:hover': {
      color: '#fff',
      opacity: 0.8,
      cursor: 'pointer',
    },
  },
})

export const homeFooterInnerWrapper = style({
  '@media': {
    '(max-width: 768px)': {
      flexDirection: 'column',
    },
  },
})

export const everythingHeading = style({
  fontSize: 28,
  maxWidth: '18rem',
  '@media': {
    '(min-width: 768px)': {
      fontSize: 50,
      maxWidth: '32rem',
    },
  },
})

export const homeSectionHeader = style({
  fontSize: 28,
  '@media': {
    '(min-width: 768px)': {
      fontSize: 50,
    },
  },
})

export const homeSectionWrapper = style({
  maxWidth: 1144,
})

export const footerHeading = style({
  '@media': {
    '(max-width: 768px)': {
      maxWidth: 246,
      fontSize: 28,
    },
  },
})

export const footerLeftWrapper = style({
  maxWidth: 733,
  paddingLeft: 32,
  '@media': {
    '(max-width: 768px)': {
      paddingLeft: 0,
      maxWidth: 246,
      fontSize: 28,
      marginLeft: 34,
    },
  },
})

export const footerRightWrapper = style({
  paddingRight: 32,
  '@media': {
    '(max-width: 768px)': {
      display: 'flex',
      alignItems: 'center',
      paddingTop: 32,
      marginTop: 32,
      borderTop: '2px solid #333333',
      paddingRight: 0,
    },
  },
})

export const marqueeItems = style({
  maxWidth: '48rem',
})

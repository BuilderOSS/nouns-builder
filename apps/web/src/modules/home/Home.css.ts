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

export const marqueeItems = style({
  maxWidth: '48rem',
})

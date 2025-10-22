import { style } from '@vanilla-extract/css'

/* TREASURY */
export const treasuryWrapper = style({
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridGap: '0.5rem',
  '@media': {
    'screen and (max-width: 1080px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    'screen and (max-width: 768px)': {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
})

export const erc20AssetsWrapper = style({
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridGap: '0.5rem',
  '@media': {
    'screen and (max-width: 768px)': {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
})

export const erc721AssetsWrapper = style({
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridGap: '1rem',
  '@media': {
    'screen and (max-width: 720px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    'screen and (max-width: 420px)': {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
})

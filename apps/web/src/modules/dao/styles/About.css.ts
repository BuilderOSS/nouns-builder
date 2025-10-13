import { atoms, media, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const about = style([
  atoms({
    m: 'auto',
  }),
  {
    maxWidth: 912,
  },
])

export const statistic = style([
  atoms({
    px: { '@initial': 'x3', '@768': 'x4' },
    py: 'x3',
  }),
  {
    border: `2px solid ${vars.color.border}`,
    borderRadius: 12,
    whiteSpace: 'nowrap',
    width: 'fit-content',
  },
])

export const statisticHover = style([
  atoms({
    px: { '@initial': 'x3', '@768': 'x4' },
    py: 'x3',
  }),
  {
    border: `2px solid ${vars.color.border}`,
    borderRadius: 12,
    whiteSpace: 'nowrap',
    width: 'fit-content',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s ease-in-out',
    ':hover': {
      backgroundColor: vars.color.border,
    },
  },
])

export const statisticContent = style([
  {
    fontSize: 20,
    lineHeight: '32px',
    padding: 0,
    '@media': {
      [media.min768]: {
        fontSize: 28,
        whiteSpace: 'nowrap',
      },
    },
  },
])

export const iconAnchor = style([
  atoms({ mr: 'x2' }),
  {
    selectors: {
      '&:last-of-type': {
        marginRight: 0,
      },
    },
  },
])

export const daoName = style({
  fontSize: 20,
  fontWeight: 700,
  overflow: 'hidden',
  wordBreak: 'break-word',
  textOverflow: 'ellipsis',
  '@media': {
    '(min-width: 768px)': {
      fontSize: 28,
    },
  },
})

export const daoDescription = style({
  fontSize: 20,
  '@media': {
    '(min-width: 768px)': {
      fontSize: 28,
    },
  },
})

export const daoInfo = style({
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
})

export const contractItemGrid = style({
  gridTemplateColumns: '1fr',
  '@media': {
    [media.min768]: {
      gridTemplateColumns: '1fr 3fr',
    },
  },
})

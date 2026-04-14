import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

const darkButtonHover = '#67676d'

export const actionButtons = style({
  width: '100%',
  '@media': {
    '(max-width: 1023px)': {
      display: 'none',
    },
  },
})

export const daoButton = style({
  borderColor: `${vars.color.border} !important`,
})

export const createPostButton = style({
  selectors: {
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: `${darkButtonHover} !important`,
      borderColor: `${darkButtonHover} !important`,
    },
  },
})

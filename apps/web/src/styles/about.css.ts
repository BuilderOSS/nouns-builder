import { globalStyle, style } from '@vanilla-extract/css'

export const whyTextStyle = style({
  maxWidth: 720,
})

globalStyle(`${whyTextStyle} > *`, {
  fontFamily: 'Arial Narrow, sans-serif!important',
})

export const whyCreateButton = style({
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

const darkWordSelector = 'html[data-theme-mode="dark"] &'

export const lightWhy = style({
  display: 'block',
  selectors: {
    [darkWordSelector]: {
      display: 'none',
    },
  },
})

export const darkWhy = style({
  display: 'none',
  selectors: {
    [darkWordSelector]: {
      display: 'block',
    },
  },
})
